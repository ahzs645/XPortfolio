var assistant = {};

(function(){
function Deferred(){
    this._state = "pending";
    this._resHandlers = [];
    this._rejHandlers = [];
    var self = this;
    this.promiseObj = new Promise(function(res, rej){
        self._resolve = function(v){
            if(self._state !== "pending") return;
            self._state = "resolved";
            try{ res(v); }catch(e){}
            self._resHandlers.forEach(function(h){ try{ h(v); }catch(e){} });
        };
        self._reject = function(e){
            if(self._state !== "pending") return;
            self._state = "rejected";
            try{ rej(e); }catch(err){}
            self._rejHandlers.forEach(function(h){ try{ h(e); }catch(e){} });
        };
    });
}
Deferred.prototype.resolve = function(v){ this._resolve(v); };
Deferred.prototype.reject = function(e){ this._reject(e); };
Deferred.prototype.done = function(cb){ if(cb) this._resHandlers.push(cb); this.promiseObj.then(cb); return this; };
Deferred.prototype.fail = function(cb){ if(cb) this._rejHandlers.push(cb); this.promiseObj.catch(cb); return this; };
Deferred.prototype.state = function(){ return this._state; };
Deferred.prototype.promise = function(){ return this; };
Deferred.prototype.then = function(a,b){ return this.promiseObj.then(a,b); };
Deferred.prototype.catch = function(b){ return this.promiseObj.catch(b); };

function when(){
    var args = Array.prototype.slice.call(arguments);
    var promises = args.map(function(d){
        if(!d) return Promise.resolve();
        if(d.promiseObj) return d.promiseObj;
        if(d.then) return d;
        return Promise.resolve(d);
    });
    return {
        done: function(cb){ Promise.all(promises).then(cb).catch(function(){}); return this; },
        fail: function(cb){ Promise.all(promises).then(function(){}, cb); return this; }
    };
}

function getOffset(el){
    var rect = el.getBoundingClientRect();
    return { left: rect.left + window.scrollX, top: rect.top + window.scrollY };
}

function isVisible(el){
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function isInDom(el){
    return !!(el && el.isConnected);
}

assistant.BASE_PATH = "/static/agents/";

assistant.load = function(containerId, name, successCb, failCb){
    if(!containerId){
        if(failCb) failCb(new Error("Container ID must be provided"));
        return;
    }
    if(!name){
        if(failCb) failCb(new Error("Agent name must be provided"));
        return;
    }
    var mount = document.getElementById(containerId);
    if(!mount){
        if(failCb) failCb(new Error("Container not found: " + containerId));
        return;
    }
    var base = assistant.BASE_PATH + name;
    var mapDfd = assistant.load._loadMap(base);
    var agentDfd = assistant.load._loadAgent(name, base);
    var soundsDfd = assistant.load._loadSounds(name, base);
    var agentData, soundsData;
    agentDfd.done(function(a){ agentData = a; });
    soundsDfd.done(function(a){ soundsData = a; });
    when(mapDfd, agentDfd, soundsDfd).done(function(){
        try{
            var old = mount.querySelector(".assistant-container");
            if(old){
                if(old.__assistantInstance && typeof old.__assistantInstance.destroy === "function"){
                    try{ old.__assistantInstance.destroy(); }catch(e){}
                }else{
                    try{ mount.removeChild(old); }catch(e){}
                }
            }
            var agent = new assistant.Agent(base, agentData, soundsData, mount);
            if(successCb) successCb(agent);
        }catch(e){
            if(failCb) failCb(e);
        }
    }).fail(function(e){
        if(failCb) failCb(e);
    });
};

assistant.load._maps = {};
assistant.load._loadMap = function(base){
    var d = assistant.load._maps[base];
    if(d) return d;
    d = assistant.load._maps[base] = new Deferred();
    var src = base + "/map.png";
    var img = new Image();
    img.onload = function(){ d.resolve(); };
    img.onerror = function(){ d.reject(new Error("Failed to load map: " + src)); };
    img.src = src;
    return d;
};

assistant.load._sounds = {};
assistant.load._loadSounds = function(name, base){
    var d = assistant.load._sounds[name];
    if(d) return d;
    d = assistant.load._sounds[name] = new Deferred();
    var scriptSrc = base + "/sounds.js";
    var s = document.createElement("script");
    s.src = scriptSrc;
    s.async = true;
    s.type = "text/javascript";
    s.onload = function(){ if(d.state && d.state() === "pending") d.resolve({}); };
    s.onerror = function(){ d.reject(new Error("Failed to load sounds script: " + scriptSrc)); };
    document.head.appendChild(s);
    return d;
};

assistant.load._data = {};
assistant.load._loadAgent = function(name, base){
    var d = assistant.load._data[name];
    if(d) return d;
    d = assistant.load._getAgentDfd(name);
    var script = base + "/agent.js";
    assistant.load._loadScript(script);
    return d;
};

assistant.load._loadScript = function(src){
    var s = document.createElement("script");
    s.setAttribute("src", src);
    s.setAttribute("async", "async");
    s.setAttribute("type", "text/javascript");
    document.head.appendChild(s);
};

assistant.load._getAgentDfd = function(name){
    var d = assistant.load._data[name];
    if(!d) d = assistant.load._data[name] = new Deferred();
    return d;
};

assistant.ready = function(name, data){
    var d = assistant.load._data[name];
    if(!d) d = assistant.load._data[name] = new Deferred();
    d.resolve(data);
};

assistant.soundsReady = function(name, data){
    var d = assistant.load._sounds[name];
    if(!d) d = assistant.load._sounds[name] = new Deferred();
    d.resolve(data);
};

assistant.Queue = function(onEmpty){
    this._queue = [];
    this._onEmptyCallback = onEmpty;
    this._active = false;
};

assistant.Queue.prototype = {
    queue: function(fn){
        this._queue.push(fn);
        if(this._queue.length === 1 && !this._active) this._progressQueue();
    },
    _progressQueue: function(){
        if(!this._queue.length){
            if(this._onEmptyCallback) this._onEmptyCallback();
            return;
        }
        var fn = this._queue.shift();
        this._active = true;
        var self = this;
        function next(){ self.next(); }
        try{
            fn(next);
        }catch(e){
            next();
        }
    },
    clear: function(){ this._queue = []; },
    next: function(){ this._active = false; this._progressQueue(); }
};

assistant.Agent = function(path, data, sounds, mount){
    this.path = path;
    this._queue = new assistant.Queue(this._onQueueEmpty.bind(this));
    this._container = document.createElement("div");
    this._container.className = "assistant-container";
    this._balloonEl = document.createElement("div");
    this._balloonEl.className = "assistant-balloon-block";
    this._agentEl = document.createElement("div");
    this._agentEl.className = "assistant-agent-block";
    this._container.appendChild(this._balloonEl);
    this._container.appendChild(this._agentEl);
    if(!mount) throw new Error("Mount element required");
    mount.appendChild(this._container);
    this._el = this._agentEl;
    this._animator = new assistant.Animator(this._agentEl, path, data, sounds);
    this._balloon = new assistant.Balloon(this._balloonEl);
    this._idleQueue = [];
    this._idleIndex = 0;
    this._idleDfd = null;
    this._idleRunning = false;
    this._randomPlaying = false;
    this._destroyed = false;
    this._boundResize = null;
    this._boundClick = null;
    this._mo = null;
    this._container.__assistantInstance = this;
    this._setupEvents();
    this._setupAutoDestroy();
};

assistant.Agent.prototype = {
    gestureAt: function(x, y){
        var dir = this._getDirection(x, y);
        var d = "Gesture" + dir;
        var e = "Look" + dir;
        var chosen = this.hasAnimation(d) ? d : e;
        return this.play(chosen);
    },
    hide: function(skip, cb){
        this._hidden = true;
        var el = this._el;
        this.stop();
        if(skip){
            el.style.display = "none";
            this.stop();
            this.pause();
            cb && cb();
            return;
        }
        this._playInternal("Hide", function(){
            el.style.display = "none";
            this.pause();
            cb && cb();
        }.bind(this));
    },
    _playInternal: function(name, cb){
        if(this._isIdleAnimation() && this._idleDfd && this._idleDfd.state && this._idleDfd.state() === "pending"){
            this._idleDfd.done(function(){ this._playInternal(name, cb); }.bind(this));
            this._animator.exitAnimation();
            return;
        }
        this._animator.showAnimation(name, cb);
    },
    play: function(name, timeout, cb){
        if(!this.hasAnimation(name)) return false;
        if(this._animator.currentAnimationName && !this._isIdleAnimation()){
            return false;
        }
        if(timeout === undefined) timeout = 5000;
        this._addToQueue(function(done){
            var finished = false;
            var onEnd = function(a, b){
                if(b === assistant.Animator.States.EXITED){
                    finished = true;
                    cb && cb();
                    done();
                }
            };
            if(timeout) setTimeout(function(){
                if(finished) return;
                this._animator.exitAnimation();
            }.bind(this), timeout);
            this._playInternal(name, onEnd.bind(this));
        }.bind(this));
        return true;
    },
    show: function(skip){
        this._hidden = false;
        if(skip){
            this._el.style.display = "block";
            this.resume();
            this._onQueueEmpty();
            return;
        }
        this.resume();
        return this.play("Show");
    },
    speak: function(text, hold, cb){
        this._addToQueue(function(done){
            this._balloon.speak(done, text, hold ? true : false);
        }.bind(this));
    },
    closeBalloon: function(){ this._balloon.hide(true); },
    delay: function(ms){
        ms = ms || 250;
        this._addToQueue(function(done){
            setTimeout(done, ms);
        });
    },
    stopCurrent: function(){
        this._animator.exitAnimation();
        this._balloon.close();
    },
    stop: function(){
        this._queue.clear();
        this._animator.exitAnimation();
        this._balloon.hide(true);
        this._idleQueue = [];
        this._idleIndex = 0;
        this._idleRunning = false;
        if(this._idleDfd && this._idleDfd.state && this._idleDfd.state() === "pending"){
            this._animator.exitAnimation();
        }
    },
    hasAnimation: function(name){ return this._animator.hasAnimation(name); },
    animations: function(){ return this._animator.animations(); },
    animate: function(){
        var a = this.animations();
        if(!a || a.length === 0) return false;
        var b = a[Math.floor(Math.random() * a.length)];
        return b.indexOf("Idle") === 0 ? this.animate() : this.play(b);
    },
    playRandomAnimation: function(){
        if(this._randomPlaying) return false;
        var anims = this.animations();
        if(!anims || anims.length === 0) return false;
        var choices = anims.filter(function(a){ return a !== "Hide" && a !== "Show"; });
        if(choices.length === 0) choices = anims;
        var randomAnim = choices[Math.floor(Math.random() * choices.length)];
        var self = this;
        this._randomPlaying = true;
        return this.play(randomAnim, undefined, function(){
            self._randomPlaying = false;
        });
    },
    _getDirection: function(x, y){
        var c = getOffset(this._el);
        var d = this._el.offsetHeight;
        var e = this._el.offsetWidth;
        var f = c.left + e / 2;
        var g = c.top + d / 2;
        var h = g - y;
        var i = f - x;
        var j = Math.round(180 * Math.atan2(h, i) / Math.PI);
        if(-45 <= j && j < 45) return "Right";
        if(45 <= j && j < 135) return "Up";
        if(135 <= j && j <= 180 || -180 <= j && j < -135) return "Left";
        if(-135 <= j && j < -45) return "Down";
        return "Top";
    },
    _onQueueEmpty: function(){
        if(this._hidden) return;
        if(this._queue._active) return;
        if(this._queue._queue && this._queue._queue.length) return;
        if(this._isIdleAnimation()) return;
        if(!this._idleQueue || this._idleQueue.length === 0) this._populateIdleQueue();
        if(!this._idleQueue || this._idleQueue.length === 0) return;
        if(this._idleRunning) return;
        this._idleRunning = true;
        this._playIdleNext();
    },
    _populateIdleQueue: function(){
        var all = this.animations() || [];
        var idle = [];
        for(var i=0;i<all.length;i++){
            var d = all[i];
            if(d && d.indexOf("Idle") === 0) idle.push(d);
        }
        for(var j = idle.length - 1; j > 0; j--){
            var k = Math.floor(Math.random() * (j + 1));
            var tmp = idle[j];
            idle[j] = idle[k];
            idle[k] = tmp;
        }
        this._idleQueue = idle;
        this._idleIndex = 0;
    },
    _playIdleNext: function(){
        if(!isInDom(this._container)){ this.stop(); this._idleRunning = false; return; }
        if(this._hidden) { this._idleRunning = false; return; }
        if(this._queue._active) { this._idleRunning = false; return; }
        if(this._queue._queue && this._queue._queue.length){ this._idleRunning = false; return; }
        if(!this._idleQueue || this._idleQueue.length === 0) this._populateIdleQueue();
        if(!this._idleQueue || this._idleQueue.length === 0){ this._idleRunning = false; return; }
        var name = this._idleQueue[this._idleIndex % this._idleQueue.length];
        this._idleIndex = (this._idleIndex + 1) % this._idleQueue.length;
        this._idleDfd = new Deferred();
        this._animator.showAnimation(name, this._onIdleComplete.bind(this), false);
    },
    _onIdleComplete: function(name, state){
        if(this._idleDfd){ this._idleDfd.resolve(); this._idleDfd = null; }
        if(state === assistant.Animator.States.WAITING){
            this._animator.exitAnimation();
            return;
        }
        if(!isInDom(this._container)){ this._idleRunning = false; return; }
        if(this._hidden) { this._idleRunning = false; return; }
        if(this._queue._active) { this._idleRunning = false; return; }
        if(this._queue._queue && this._queue._queue.length){ this._idleRunning = false; return; }
        this._playIdleNext();
    },
    _isIdleAnimation: function(){
        var a = this._animator.currentAnimationName;
        return a && a.indexOf("Idle") === 0;
    },
    _getIdleAnimation: function(){
        var all = this.animations() || [], idle = [];
        for(var i=0;i<all.length;i++){
            var d = all[i];
            if(d && d.indexOf("Idle") === 0) idle.push(d);
        }
        if(idle.length === 0) return null;
        return idle[Math.floor(Math.random() * idle.length)];
    },
    _setupEvents: function(){
        var self = this;
        this._boundClick = function(){
            if(self._randomPlaying) return;
            self.playRandomAnimation();
        };
        this._agentEl.addEventListener("click", this._boundClick);
        this._boundResize = function(){};
        window.addEventListener("resize", this._boundResize);
    },
    _addToQueue: function(fn){
        this._queue.queue(fn.bind(this));
    },
    pause: function(){ this._animator.pause(); this._balloon.pause(); },
    resume: function(){ this._animator.resume(); this._balloon.resume(); },
    _setupAutoDestroy: function(){
        var self = this;
        var obs = new MutationObserver(function(){
            if(!isInDom(self._container)){
                try{ self.destroy(); }catch(e){}
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        this._mo = obs;
    },
    destroy: function(){
        if(this._destroyed) return;
        this._destroyed = true;
        try{ this.stop(); }catch(e){}
        try{ this.pause(); }catch(e){}
        try{
            if(this._idleDfd && this._idleDfd.state && this._idleDfd.state() === "pending"){
                this._idleDfd.resolve();
            }
        }catch(e){}
        try{ if(this._mo){ this._mo.disconnect(); this._mo = null; } }catch(e){}
        try{
            if(this._boundClick) this._agentEl.removeEventListener("click", this._boundClick);
            this._boundClick = null;
            if(this._boundResize) window.removeEventListener("resize", this._boundResize);
            this._boundResize = null;
        }catch(e){}
        try{ if(this._animator) this._animator.destroy(); }catch(e){}
        try{ if(this._balloon && this._balloon._balloon){ this._balloon._balloon.remove(); } }catch(e){}
        try{
            if(this._container && this._container.parentNode){
                this._container.parentNode.removeChild(this._container);
            }
        }catch(e){}
        try{ delete this._container.__assistantInstance; }catch(e){}
        this._container = null;
        this._agentEl = null;
        this._balloonEl = null;
        this._animator = null;
        this._balloon = null;
        this._queue = null;
    }
};

assistant.Animator = function(el, path, data, sounds){
    this._el = el;
    this._data = data || {};
    this._path = path;
    this._currentFrameIndex = 0;
    this._currentFrame = undefined;
    this._exiting = false;
    this._currentAnimation = undefined;
    this._endCallback = undefined;
    this._started = false;
    this._sounds = {};
    this.currentAnimationName = undefined;
    this.preloadSounds(sounds || {});
    this._overlays = [this._el];
    var e = this._el;
    this._setupElement(this._el);
    for(var f=1; f < (this._data.overlayCount || 1); f++){
        var g = this._setupElement(document.createElement("div"));
        e.appendChild(g);
        this._overlays.push(g);
        e = g;
    }
};

assistant.Animator.prototype = {
    _setupElement: function(el){
        var b = this._data.framesize || [0,0];
        el.style.display = "none";
        el.style.width = (b[0] || 0) + "px";
        el.style.height = (b[1] || 0) + "px";
        el.style.backgroundImage = "url('" + this._path + "/map.png')";
        el.style.backgroundRepeat = "no-repeat";
        el.style.overflow = "hidden";
        return el;
    },
    animations: function(){
        var a = [], b = this._data.animations || {};
        for(var c in b) if(Object.prototype.hasOwnProperty.call(b, c)) a.push(c);
        return a;
    },
    preloadSounds: function(map){
        var list = this._data.sounds || [];
        for(var i=0;i<list.length;i++){
            var key = list[i];
            var src = map[key];
            if(!src) continue;
            try{
                this._sounds[key] = new Audio(src);
            }catch(e){}
        }
    },
    hasAnimation: function(name){
        return !!(this._data.animations && this._data.animations[name]);
    },
    exitAnimation: function(){ this._exiting = true; },
    showAnimation: function(name, cb, loop){
        this._exiting = false;
        if(!this.hasAnimation(name)) return false;
        this._currentAnimation = this._data.animations[name];
        this.currentAnimationName = name;
        this._currentFrameIndex = 0;
        this._currentFrame = undefined;
        this._endCallback = cb;
        this._loopingAnimation = !!loop;
        if(!this._started){
            this._started = true;
            this._step();
            return true;
        }
        if(!this._loop){
            this._step();
        }
        return true;
    },
    _draw: function(){
        var imgs = [];
        if(this._currentFrame && this._currentFrame.images) imgs = this._currentFrame.images;
        for(var i=0;i<this._overlays.length;i++){
            if(i < imgs.length){
                var c = imgs[i];
                var pos = (-c[0]) + "px " + (-c[1]) + "px";
                var o = this._overlays[i];
                o.style.backgroundPosition = pos;
                o.style.display = "block";
            }else{
                var o2 = this._overlays[i];
                o2.style.display = "none";
            }
        }
    },
    _getNextAnimationFrame: function(){
        if(!this._currentAnimation) return undefined;
        if(!this._currentFrame) return 0;
        var a = this._currentFrame, b = this._currentFrame.branching;
        if(this._exiting && a.exitBranch !== undefined) return a.exitBranch;
        if(b){
            var r = Math.random() * 100;
            for(var i=0;i<b.branches.length;i++){
                var e = b.branches[i];
                if(r <= e.weight) return e.frameIndex;
                r -= e.weight;
            }
        }
        return this._currentFrameIndex + 1;
    },
    _playSound: function(){
        var a = this._currentFrame && this._currentFrame.sound;
        if(!a) return;
        var s = this._sounds[a];
        if(s && s.play) try{ s.play(); }catch(e){}
    },
    _atLastFrame: function(){
        return this._currentFrameIndex >= (this._currentAnimation.frames.length - 1);
    },
    _step: function(){
        if(!this._currentAnimation) return;
        if(!isInDom(this._el)){
            this.pause();
            this._stopAllSounds();
            return;
        }
        var nextIndex = this._getNextAnimationFrame();
        if(nextIndex === undefined) return;
        if(this._atLastFrame() && this._loopingAnimation && !this._exiting){
            nextIndex = 0;
        }
        var a = Math.min(nextIndex, this._currentAnimation.frames.length - 1);
        var frameChanged = this._currentFrameIndex !== a;
        this._currentFrameIndex = a;
        if(!this._atLastFrame() || !this._currentAnimation.useExitBranching || this._loopingAnimation){
            this._currentFrame = this._currentAnimation.frames[this._currentFrameIndex];
        }
        this._draw();
        this._playSound();
        var dur = (this._currentFrame && this._currentFrame.duration) || 100;
        if(this._loop){
            window.clearTimeout(this._loop);
            this._loop = null;
        }
        var self = this;
        if(!this._exiting || !this._atLastFrame() || this._loopingAnimation){
            this._loop = window.setTimeout(function(){ self._step(); }, dur);
        }
        if(this._endCallback && frameChanged && this._atLastFrame() && (!this._loopingAnimation || this._exiting)){
            var cb = this._endCallback;
            this._endCallback = undefined;
            if(this._currentAnimation.useExitBranching && !this._exiting){
                cb(this.currentAnimationName, assistant.Animator.States.WAITING);
            }else{
                cb(this.currentAnimationName, assistant.Animator.States.EXITED);
            }
        }
    },
    _stopAllSounds: function(){
        for(var k in this._sounds){
            if(Object.prototype.hasOwnProperty.call(this._sounds, k)){
                var s = this._sounds[k];
                try{
                    if(s && s.pause) s.pause();
                    if(s) s.currentTime = 0;
                }catch(e){}
            }
        }
    },
    pause: function(){
        if(this._loop){
            window.clearTimeout(this._loop);
            this._loop = null;
        }
    },
    resume: function(){
        if(!this._currentAnimation) return;
        if(!this._loop){
            this._step();
        }
    },
    destroy: function(){
        try{ this.pause(); }catch(e){}
        try{ this._stopAllSounds(); }catch(e){}
        try{
            for(var i=0;i<this._overlays.length;i++){
                var o = this._overlays[i];
                if(o && o.parentNode) try{ o.parentNode.removeChild(o); }catch(e){}
            }
        }catch(e){}
        this._overlays = null;
        this._currentAnimation = null;
        this._currentFrame = null;
        this._sounds = {};
        this._el = null;
    }
};

assistant.Animator.States = { WAITING: 1, EXITED: 0 };

assistant.Balloon = function(targetEl){
    this._targetEl = targetEl;
    this._hidden = true;
    this._setup();
};

assistant.Balloon.prototype = {
    CLOSE_BALLOON_DELAY: 60000,
    _setup: function(){
        this._balloon = document.createElement("div");
        this._balloon.className = "assistant-balloon";
        var tip = document.createElement("div");
        tip.className = "assistant-tip";
        var content = document.createElement("div");
        content.className = "assistant-content";
        this._balloon.appendChild(tip);
        this._balloon.appendChild(content);
        this._balloon.style.display = "none";
        this._content = content;
        this._targetEl.appendChild(this._balloon);
    },
    reposition: function(){},
    _position: function(){},
    _isOut: function(){ return false; },
    speak: function(doneCallback, text, hold){
        this._hidden = false;
        this.show();
        this._content.innerHTML = text;
        this._complete = doneCallback;
        this._hold = !!hold;
        if(!this._hold){
            doneCallback && doneCallback();
        }
    },
    show: function(){
        this._hidden = false;
        this._balloon.style.display = "block";
    },
    hide: function(immediate){
        if(immediate){
            this._balloon.style.display = "none";
            this._hidden = true;
            return;
        }
        this._finishHideBalloon();
    },
    _finishHideBalloon: function(){
        this._balloon.style.display = "none";
        this._hidden = true;
        this._hiding = null;
    },
    close: function(){
        if(this._hold){
            this._hold = false;
            if(this._complete) this._complete();
        }else{
            if(this._complete) this._complete();
        }
    },
    pause: function(){
        if(this._hiding){ window.clearTimeout(this._hiding); this._hiding = null; }
    },
    resume: function(){
    }
};
})();
