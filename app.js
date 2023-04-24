import getj from './js/getj.js';
import './js/dior.js';

// shim
const originalFetch = window.fetch;

window.fetch = async function (url, options) {
  const newOptions = { ...options };


  if (newOptions.method === 'PUT') {
    const event = {
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['u', url]],
      content: ''
    }
    const signedEvent = await window.nostr.signEvent(event)
    var auth = `Nostr ${btoa(JSON.stringify(signedEvent))}`


    newOptions.headers = {
      ...newOptions.headers,
      'authorization': auth
    };
  }

  return originalFetch.call(this, url, newOptions);
};


// code
export function getQueryStringValue(key) {
  const queryString = window.location.search.substring(1);
  const queryParams = new URLSearchParams(queryString);
  return queryParams.get(key);
}

console.log(9);
const uri = getQueryStringValue('uri');
console.log('uri', uri);
let page = [];
if (uri) {
  page = await getj(uri);
  console.log('page', page);
}

console.log('DOMContentLoaded');
const data = di.data;
const mainEntity = page?.[0]?.mainEntity || data[0].mainEntity;

const table = document.createElement('table');
table.setAttribute('style', 'border-collapse: collapse; width: 80%; margin: 50px auto; font-family: Arial, sans-serif;');

const tableBody = document.createElement('tbody');

// ... (previous code remains the same)

let appRow;
mainEntity.app.forEach((appUrl, index) => {
  if (index % 3 === 0) {
    appRow = document.createElement('tr');
    tableBody.appendChild(appRow);
  }

  const appInfo = data.find((item) => item['@id'] === appUrl) || { '@id': appUrl, label: appUrl };

  const appCell = document.createElement('td');
  const backgroundColor = index % 6 < 3 ? '#e0f2ff' : '#c8e1ff';
  appCell.setAttribute('style', `border: 1px solid #ccc; padding: 10px; width: 33%; height: 0; padding-bottom: 20%; position: relative; background-color: ${backgroundColor};`);

  const appLink = document.createElement('a');
  appLink.href = appInfo['@id'];
  appLink.target = '_blank';
  appLink.textContent = appInfo.label;
  appLink.setAttribute('style', 'text-decoration: none; color: #1a73e8; font-weight: bold; font-size: 1.2em; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;');

  const editIcon = document.createElement('span');
  editIcon.innerHTML = '&#9998;'; // Pencil icon (Unicode character)
  editIcon.setAttribute('style', 'position: absolute; top: 5px; right: 5px; cursor: pointer;');
  editIcon.addEventListener('click', (event) => {
    event.preventDefault();
    const newLabel = prompt('Enter a new label:', appInfo.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      appInfo.label = newLabel.trim();
      appLink.textContent = appInfo.label;
    }
  });

  appCell.appendChild(appLink);
  appCell.appendChild(editIcon);
  appRow.appendChild(appCell);
});

table.appendChild(tableBody);
document.body.appendChild(table);

// ... (previous code remains the same)

function updateThis(id, uri) {
  fetch(uri || location.href)
    .then((response) =>
      response.text().then((html) => {
        const newhtml = html.replace(
          /(<script[^>]*type="application[^>]*>)([\s\S]*?)(<\/script>)/gim,
          '$1' + JSON.stringify(di[id], null, 2) + '$3'
        );
        if (newhtml !== html) {
          fetch(uri || location.href, {
            method: 'PUT',
            body: newhtml,
            headers: {
              'content-type': 'text/html',
            },
          }).then(console.log);
        }
      })
    );
}

// ... (rest of the code remains the same)

document.body.appendChild(table);

const updateButton = document.createElement('button');
updateButton.textContent = 'Update this';
updateButton.setAttribute('style', 'display: block; margin: 20px auto;');
updateButton.addEventListener('click', () => {
  const id = 'data'; // Replace 'your_default_id' with a suitable default value if needed
  updateThis(id, uri);
});

document.body.appendChild(updateButton);



// ... (previous code remains the same)
function addAppSquare(appInfo) {
  const index = mainEntity.app.length;
  if (index % 3 === 0) {
    appRow = document.createElement('tr');
    tableBody.appendChild(appRow);
  }

  const appCell = document.createElement('td');
  const backgroundColor = index % 6 < 3 ? '#e0f2ff' : '#c8e1ff';
  appCell.setAttribute('style', `border: 1px solid #ccc; padding: 10px; width: 33%; height: 0; padding-bottom: 20%; position: relative; background-color: ${backgroundColor};`);

  const appLink = document.createElement('a');
  appLink.href = appInfo['@id'];
  appLink.target = '_blank';
  appLink.textContent = appInfo.label;
  appLink.setAttribute('style', 'text-decoration: none; color: #1a73e8; font-weight: bold; font-size: 1.2em; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;');

  const editIcon = document.createElement('span');
  editIcon.innerHTML = '&#9998;'; // Pencil icon (Unicode character)
  editIcon.setAttribute('style', 'position: absolute; top: 5px; right: 5px; cursor: pointer;');
  editIcon.addEventListener('click', (event) => {
    event.preventDefault();
    const newLabel = prompt('Enter a new label:', appInfo.label);
    if (newLabel !== null && newLabel.trim() !== '') {
      appInfo.label = newLabel.trim();
      appLink.textContent = appInfo.label;
    }
  });


  appCell.appendChild(appLink);
  appCell.appendChild(editIcon);
  appRow.appendChild(appCell);
  mainEntity.app.push(appInfo['@id']);

}

// ... (rest of the code remains the same)

const addButtonCell = document.createElement('td');
addButtonCell.setAttribute('style', 'border: 1px solid #ccc; padding: 10px; width: 33%; height: 0; padding-bottom: 20%; position: relative; background-color: #fff;');
const addButton = document.createElement('button');
addButton.textContent = '+';
addButton.setAttribute('style', 'font-size: 2em; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border: none; background-color: transparent;');
addButton.addEventListener('click', () => {
  const uri = prompt('Enter the app URI:');
  if (uri !== null && uri.trim() !== '') {
    const label = prompt('Enter the app label:');
    if (label !== null && label.trim() !== '') {
      const appInfo = { '@id': uri.trim(), label: label.trim() };
      addAppSquare(appInfo);
    }
  }
});

addButtonCell.appendChild(addButton);
appRow.appendChild(addButtonCell);
// ... (rest of the code remains the same)
