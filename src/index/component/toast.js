import './toast.css';

export default class Toast {
  default = {
    duration: 1000,
    type: '',
    content: '',
  };
  constructor(options) {
    this.settings = Object.assign({}, this.default, options);
    this.toast = {};
    this.id = `Toast${Date.now()}${Math.floor(Math.random() * 100)}`;
  }
  show() {
    const template = `
        <div id="${this.id}" class="toast toast-center toast-middle">
            ${
  this.settings.type === 'loading'
    ? ' <span class="loading loading-spinner"></span>'
    : ''
}
            <span>${this.settings.content}</span>
        <div>
        `;
    this.toast = $('body').append(template).find(`#${this.id}`);
    if (this.settings.duration) {
      setTimeout(() => {
        this.destroy();
      }, this.settings.duration);
    }
  }
  destroy() {
    if (!this.toast) {
      return;
    }
    this.toast.remove();
    this.toast = null;
  }
}

export function showDefaultToast(content) {
  const toast = new Toast({
    content,
  });
  toast.show();
}
