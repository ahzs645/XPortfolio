/**
 * Archive class for extracting zip/rar files using libarchive.js
 */

class Archive {
  static _options = null;

  static init(options = {}) {
    Archive._options = {
      workerUrl: '/js/libarchive/worker-bundle.js',
      ...options
    };
    return Archive._options;
  }

  static async open(file, options = null) {
    options = options || Archive._options || Archive.init();
    const arch = new Archive(file, options);
    return arch.open();
  }

  constructor(file, options) {
    this._worker = new Worker(options.workerUrl);
    this._worker.addEventListener('message', this._workerMsg.bind(this));
    this._worker.addEventListener('error', (e) => {
      console.error('[Archive] Worker error:', e);
    });
    this._callbacks = [];
    this._content = {};
    this._processed = 0;
    this._file = file;
  }

  async open() {
    await this._postMessage({ type: 'HELLO' }, (resolve, reject, msg) => {
      if (msg.type === 'READY') {
        resolve();
      }
    });
    return await this._postMessage({ type: 'OPEN', file: this._file }, (resolve, reject, msg) => {
      if (msg.type === 'OPENED') {
        resolve(this);
      }
    });
  }

  hasEncryptedData() {
    return this._postMessage({ type: 'CHECK_ENCRYPTION' },
      (resolve, reject, msg) => {
        if (msg.type === 'ENCRYPTION_STATUS') {
          resolve(msg.status);
        }
      }
    );
  }

  usePassword(archivePassword) {
    return this._postMessage({ type: 'SET_PASSPHRASE', passphrase: archivePassword },
      (resolve, reject, msg) => {
        if (msg.type === 'PASSPHRASE_STATUS') {
          resolve(msg.status);
        }
      }
    );
  }

  extractFiles(extractCallback) {
    if (this._processed > 1) {
      return Promise.resolve().then(() => this._content);
    }
    return this._postMessage({ type: 'EXTRACT_FILES' }, (resolve, reject, msg) => {
      if (msg.type === 'ENTRY') {
        const [target, prop] = this._getProp(this._content, msg.entry.path);
        if (msg.entry.type === 'FILE') {
          target[prop] = new File([msg.entry.fileData], msg.entry.fileName, {
            type: 'application/octet-stream'
          });
          if (extractCallback !== undefined) {
            setTimeout(extractCallback.bind(null, {
              file: target[prop],
              path: msg.entry.path,
            }));
          }
        }
        return true;
      } else if (msg.type === 'END') {
        this._processed = 2;
        this._worker.terminate();
        resolve(this._cloneContent(this._content));
      }
    });
  }

  terminate() {
    if (this._worker) {
      this._worker.terminate();
    }
  }

  _cloneContent(obj) {
    if (obj instanceof File || obj === null) return obj;
    const o = {};
    for (const prop of Object.keys(obj)) {
      o[prop] = this._cloneContent(obj[prop]);
    }
    return o;
  }

  _getProp(obj, path) {
    const parts = path.split('/');
    if (parts[parts.length - 1] === '') parts.pop();
    let cur = obj, prev = null;
    for (const part of parts) {
      cur[part] = cur[part] || {};
      prev = cur;
      cur = cur[part];
    }
    return [prev, parts[parts.length - 1]];
  }

  _postMessage(msg, callback) {
    this._worker.postMessage(msg);
    return new Promise((resolve, reject) => {
      this._callbacks.push(this._msgHandler.bind(this, callback, resolve, reject));
    });
  }

  _msgHandler(callback, resolve, reject, msg) {
    if (msg.type === 'BUSY') {
      reject(new Error('worker is busy'));
    } else if (msg.type === 'ERROR') {
      reject(new Error(msg.error));
    } else {
      return callback(resolve, reject, msg);
    }
  }

  _workerMsg({ data: msg }) {
    const callback = this._callbacks[this._callbacks.length - 1];
    const next = callback(msg);
    if (!next) {
      this._callbacks.pop();
    }
  }
}

export default Archive;
