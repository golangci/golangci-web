export function initWidgets() {
  let VK = (window as any).VK;
  if (!VK) {
    // TODO: send log error
    return;
  }

  VK.init({apiId: 5892319, onlyWidgets: true});
  console.log('initializing VK');
  return widgets();
}

function widgets() {
  let VK = (window as any).VK;
  return VK.Widgets;
}
