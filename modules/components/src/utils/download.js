let httpHeaders = {};

function getIFrameBody(iframe) {
  const document = iframe.contentWindow || iframe.contentDocument;
  return (document.document || document).body;
}

function toHtml(key, value) {
  return `<input
    type="hidden"
    name="${key}"
    aria-label="${key}"
    value="${typeof value === 'object' ? JSON.stringify(value).replace(/"/g, '&quot;') : value}"
  />`;
}

function createIFrame({ method, url, fields }) {
  const iFrame = document.createElement('iframe');

  iFrame.style.display = 'none';
  iFrame.src = 'about:blank';
  iFrame.onload = function () {
    this.__frame__loaded = true;
  };
  // Appending to document body to allow navigation away from the current
  // page and downloads in the background
  document.body.appendChild(iFrame);
  iFrame.__frame__loaded = false;

  const form = document.createElement('form');
  form.method = method.toUpperCase();
  form.action = url;
  form.innerHTML = fields;
  getIFrameBody(iFrame).appendChild(form);
  form.submit();

  return iFrame;
}

function getCookie(name) {
  let matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

async function download({ url, headers = {}, params, method = 'GET' }) {
  const token = {
    Authorization: `Bearer ${
      process.env.STORYBOOK_ENV === 'dev' ? process.env.STORYBOOK_TOKEN : getCookie('AUTH')
    }`,
  };

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers, ...token },
    body: JSON.stringify(params),
  });

  // convert response to blob and extract url
  const blob = await res.blob(); // blob is a file-like object that contains raw data read as text or binary data
  const downloadUrl = window.URL.createObjectURL(blob);
  const fileName = params.files[0].fileName;

  // create temporary download link and click it
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.setAttribute('download', fileName);
  downloadLink.setAttribute('target', '_blank');

  // add download link to dom and remove it after synthetic click
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // revoke url
  window.URL.revokeObjectURL(downloadUrl);
}

export const addDownloadHttpHeaders = (headers) => {
  httpHeaders = { ...httpHeaders, ...headers };
};

export default download;
