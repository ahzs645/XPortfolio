import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';

const fromInput = document.getElementById('contact-from'),
    subjectInput = document.getElementById('contact-subject'),
    messageTextarea = document.getElementById('contact-message');
let moduleContactName = 'User Name',
    moduleContactEmail = 'user@example.com';
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const portfolio = new PortfolioManager();
        await portfolio.initialize();
        
        moduleContactName = portfolio.getFullName() || moduleContactName;
        moduleContactEmail = portfolio.getEmail() || moduleContactEmail;
    } catch (error) {
        console.error('Failed to load portfolio data for contact form:', error);
    }
    const toInput = document.getElementById('contact-to');
    toInput && (toInput.value = moduleContactName + ' <' + moduleContactEmail + '>');

    function clearForm() {
        if (fromInput) fromInput.value = '';
        if (subjectInput) subjectInput.value = '';
        if (messageTextarea) messageTextarea.value = '';
        notifyFormState();
    }
    window.addEventListener('message', event => {
        if (event.data && typeof event.data === 'object') {
            if (event.data.command === 'getFormData' || event.data.type === 'contact:form-data:request') {
                window.parent && window.parent !== window && window.parent.postMessage({
                    'type': 'contact:form-data:response',
                    'data': getFormData(),
                    'sourceWindowId': event.data.sourceWindowId
                }, '*');
                return;
            }
            switch (event.data.command) {
                case 'newMessage':
                    clearForm();
                    break;
            }
            event.data.type === 'contact:clear-form' && clearForm();
        }
        if (event.data && event.data.type === 'toolbar:action') {
            if (event.data.action === 'newMessage') clearForm();
            else event.data.action === 'sendMessage' && sendMessage();
        }
    });
});

function getFormData() {
    const formData = {};
    return formData.to = '"' + moduleContactName + '" <' + moduleContactEmail + '>', formData.from = fromInput ? fromInput.value : '', formData.subject = subjectInput ? subjectInput.value : '', formData.message = messageTextarea ? messageTextarea.value : '', formData;
}

function sendMessage() {
    window.parent && window.parent !== window && window.parent.postMessage({
        'type': 'contact:form-data:response',
        'data': getFormData()
    }, '*');
}

function notifyParentIframeInteraction() {
    window.parent && window.parent !== window && window.parent.postMessage({
        'type': 'window:iframe-interaction',
        'windowId': window.name
    }, '*');
}
document.addEventListener('click', notifyParentIframeInteraction, !![]);

function notifyFormState() {
    const hasValue = fromInput && fromInput.value.trim() || subjectInput && subjectInput.value.trim() || messageTextarea && messageTextarea.value.trim();
    window.parent && window.parent !== window && window.parent.postMessage({
        'type': 'contact:form-state',
        'hasValue': !!hasValue,
        'windowId': window.name
    }, '*');
} [fromInput, subjectInput, messageTextarea].forEach(inputElement => {
    inputElement && inputElement.addEventListener('input', notifyFormState);
}), window.addEventListener('DOMContentLoaded', notifyFormState);

function softResetContactApp() {
    try {
        document.activeElement && document.activeElement.blur && document.activeElement.blur(), notifyFormState();
    } catch (error) {}
}
window.addEventListener('message', event => {
    event?.data?.type === 'window:soft-reset' && softResetContactApp();
});