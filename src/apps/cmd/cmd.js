(function() {
    const _0x4ab1fa = document['getElementById']('console');
    let _0x10c822 = 'C:\x5c';
    const _0x439dbd = [];
    let _0x4ea3d5 = -0x1;
    const _0x4d3204 = ['MitchIvin\x20XP\x20v2.0\x20(Aug\x202025)', 'Inspired\x20by\x20Windows\x20XP', '', 'Type\x20\x27help\x27\x20to\x20see\x20available\x20commands', '', '']['join']('\x0d\x0a');
    let _0x16c1d9 = 0x0,
        _0x457a9a = ![];

    function _0x519efe() {
        return _0x10c822 + '>\x20';
    }

    function _0x10999a(_0x1be6c1) {
        _0x1be6c1 && _0x1be6c1['length'] && (_0x457a9a = !![]), _0x4ab1fa['value'] += _0x1be6c1, _0x4ab1fa['scrollTop'] = _0x4ab1fa['scrollHeight'];
    }

    function _0xf6e769() {
        _0x10999a('\x0d\x0a');
    }

    function _0x490bf6(_0x1d3075) {
        _0x10999a(_0x1d3075), _0xf6e769();
    }

    function _0x1ded5b() {
        _0x457a9a && _0xf6e769(), _0x10999a(_0x519efe()), _0x16c1d9 = _0x4ab1fa['value']['length'];
    }

    function _0x2a06a0(_0xec59a6) {
        const _0x7603fa = _0xec59a6['trim']()['split'](/\s+/),
            _0x1e9b5d = (_0x7603fa['shift']() || '')['toLowerCase']();
        let _0x562fc4 = ![];
        switch (_0x1e9b5d) {
            case 'help':
                _0x490bf6('Info:\x20AUTHOR,\x20STACK,\x20DISCLAIMER'), _0x490bf6('Commands:\x20DATE,\x20TIME,\x20VER,\x20HELP,\x20EXIT');
                break;
            case 'ver':
                _0x490bf6(_0x4d3204['split']('\x0d\x0a')[0x0]);
                break;
            case 'time':
                _0x490bf6(new Date()['toLocaleTimeString']());
                break;
            case 'date':
                _0x490bf6(new Date()['toLocaleDateString']());
                break;
            case 'exit':
                try {
                    const _0x3aca5e = {};
                    _0x3aca5e['type'] = 'close-window', parent['postMessage'](_0x3aca5e, '*');
                } catch (_0x4dbcb0) {}
                break;
            case 'author':
                _0x490bf6('Designed\x20and\x20developed\x20by\x20Mitchell\x20Ivin,\x20created\x20with\x20the\x20assistance\x20of\x20AI\x20coding\x20tools');
                break;
            case 'stack':
                _0x490bf6('Tech\x20Stack:\x20HTML,\x20CSS,\x20JavaScript'), _0x490bf6('Key\x20Dependencies:\x20xp.css,\x20jspaint');
                break;
            case 'disclaimer':
                _0x490bf6('This\x20site\x20is\x20a\x20personal\x20portfolio\x20project.\x20All\x20logos,\x20artwork,\x20and\x20assets\x20referenced\x20remain\x20the\x20property\x20of\x20their\x20respective\x20owners.\x20They\x20are\x20included\x20here\x20as\x20inspiration,\x20homage,\x20or\x20parody,\x20not\x20as\x20original\x20creations\x20or\x20with\x20any\x20claim\x20of\x20ownership.\x20This\x20project\x20is\x20independent\x20and\x20has\x20no\x20affiliation\x20with\x20or\x20endorsement\x20from\x20the\x20original\x20creators.');
                break;
            default:
                if (_0x1e9b5d) _0x490bf6('\x27' + _0x1e9b5d + '\x27\x20is\x20not\x20recognized\x20as\x20an\x20internal\x20or\x20external\x20command.');
        }
        const _0x24d95b = {};
        return _0x24d95b['cleared'] = _0x562fc4, _0x24d95b;
    }

    function _0x18bf07() {
        (_0x4ab1fa['selectionStart'] < _0x16c1d9 || _0x4ab1fa['selectionEnd'] < _0x16c1d9) && _0x4ab1fa['setSelectionRange'](_0x4ab1fa['value']['length'], _0x4ab1fa['value']['length']);
    }
    _0x4ab1fa['addEventListener']('keydown', _0x48fb9a => {
        if (_0x48fb9a['key'] === 'Backspace' && _0x4ab1fa['selectionStart'] <= _0x16c1d9 && _0x4ab1fa['selectionEnd'] <= _0x16c1d9 || _0x48fb9a['key'] === 'Delete' && _0x4ab1fa['selectionStart'] < _0x16c1d9 || _0x48fb9a['key'] === 'ArrowLeft' && _0x4ab1fa['selectionStart'] <= _0x16c1d9 || _0x48fb9a['key'] === 'Home') {
            _0x48fb9a['preventDefault'](), _0x4ab1fa['setSelectionRange'](_0x16c1d9, _0x16c1d9);
            return;
        }
        if (_0x48fb9a['key'] === 'Enter') {
            _0x48fb9a['preventDefault']();
            const _0x127c01 = _0x4ab1fa['value']['slice'](_0x16c1d9)['replace'](/[\r\n]+/g, '');
            _0x439dbd['unshift'](_0x127c01), _0x4ea3d5 = -0x1, _0xf6e769(), _0x457a9a = ![], _0x2a06a0(_0x127c01), _0x1ded5b();
        } else {
            if (_0x48fb9a['key'] === 'ArrowUp') _0x439dbd[_0x4ea3d5 + 0x1] && (_0x4ea3d5++, _0x4ab1fa['value'] = _0x4ab1fa['value']['slice'](0x0, _0x16c1d9) + _0x439dbd[_0x4ea3d5], _0x4ab1fa['setSelectionRange'](_0x4ab1fa['value']['length'], _0x4ab1fa['value']['length'])), _0x48fb9a['preventDefault']();
            else _0x48fb9a['key'] === 'ArrowDown' && (_0x4ea3d5 > 0x0 ? (_0x4ea3d5--, _0x4ab1fa['value'] = _0x4ab1fa['value']['slice'](0x0, _0x16c1d9) + _0x439dbd[_0x4ea3d5]) : (_0x4ea3d5 = -0x1, _0x4ab1fa['value'] = _0x4ab1fa['value']['slice'](0x0, _0x16c1d9)), _0x4ab1fa['setSelectionRange'](_0x4ab1fa['value']['length'], _0x4ab1fa['value']['length']), _0x48fb9a['preventDefault']());
        }
    }), ['mouseup', 'keyup', 'focus', 'click']['forEach'](_0x5227b9 => _0x4ab1fa['addEventListener'](_0x5227b9, _0x18bf07)), _0x4ab1fa['addEventListener']('click', () => {
        _0x4ab1fa['focus'](), _0x4ab1fa['setSelectionRange'](_0x4ab1fa['value']['length'], _0x4ab1fa['value']['length']);
    }), _0x4ab1fa['addEventListener']('paste', _0x27deca => {
        _0x4ab1fa['selectionStart'] < _0x16c1d9 && (_0x27deca['preventDefault'](), _0x10999a((_0x27deca['clipboardData'] || window['clipboardData'])['getData']('text')));
    }), _0x4ab1fa['value'] = _0x4d3204 + _0x519efe(), _0x16c1d9 = _0x4ab1fa['value']['length'], _0x4ab1fa['focus'](), _0x4ab1fa['setSelectionRange'](_0x4ab1fa['value']['length'], _0x4ab1fa['value']['length']);
}());