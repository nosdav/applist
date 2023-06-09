import { html, Component, render } from './js/spux.js'
import { getPath, getQueryStringValue, loadFile, saveFile } from './util.js'
import { findNestedObjectById } from './js/linkedobjects.js'
import './js/dior.js'
import getj from './js/getj.js'

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


class App extends Component {
  state = {
    uri: '',
    data: [],
    mainEntity: null,
    appRows: [],
  };

  async componentDidMount() {
    const uri = getQueryStringValue('uri');
    let page = [];
    if (uri) {
      page = await getj(uri);
      di.data = page
    }

    const data = page || di.data;
    const mainEntity = page?.[0]?.mainEntity || data[0].mainEntity;

    const appRows = this.createAppRows(mainEntity.app, data);
    const addButtonCell = this.createAddButtonCell();

    this.setState({ uri, data, mainEntity, appRows, addButtonCell });
  }

  updateThis(id) {
    var uri = this.state.uri || location.href
    fetch(uri || location.href).then(response =>
      response.text().then(html => {
        var newhtml = html.replace(
          /(<script[^>]*type="application[^>]*>)([\s\S]*?)(<\/script>)/gim,
          '$1' + JSON.stringify(this.state.data, null, 2) + '$3'
        )
        if (newhtml !== html) {
          fetch(uri || location.href, {
            method: 'PUT',
            body: newhtml,
            headers: {
              'content-type': 'text/html'
            }
          }).then(console.log)
        }
      })
    )
  }



  createAppRows(apps, data) {
    const appRows = [];
    let appRow = [];

    apps.forEach((appUrl, index) => {
      if (index % 3 === 0 && appRow.length > 0) {
        appRows.push(appRow);
        appRow = [];
      }

      const appInfo = data.find((item) => item['@id'] === appUrl) || { '@id': appUrl, label: appUrl };
      const backgroundColor = index % 6 < 3 ? '#e0f2ff' : '#c8e1ff';

      const appCell = html`
        <td
          style="border: 1px solid #ccc; padding: 10px; width: 33%; height: 0; padding-bottom: 20%; position: relative; background-color: ${backgroundColor};"
        >
          <a
            href=${appInfo['@id']}
            target="_blank"
            style="text-decoration: none; color: #1a73e8; font-weight: bold; font-size: 1.2em; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;"
          >
            ${appInfo.label}
          </a>
          <span
            onClick=${(event) => {
          event.preventDefault();
          const newLabel = prompt('Enter a new label:', appInfo.label);
          if (newLabel !== null && newLabel.trim() !== '') {
            appInfo.label = newLabel.trim();
            this.setState({}); // Force a re-render of the component
          }
        }}
            style="position: absolute; top: 5px; right: 5px; cursor: pointer;"
          >
          ✍
          </span>
        </td>
      `;

      appRow.push(appCell);
    });

    if (appRow.length > 0) {
      appRows.push(appRow);
    }

    return appRows;
  }

  createAddButtonCell() {
    const addButtonCell = html`
      <td
        style="border: 1px solid #ccc; padding: 10px; width: 33%; height: 0; padding-bottom: 20%; position: relative; background-color: #fff;"
      >
        <button
          onClick=${() => {
        const appUri = prompt('Enter the new app URI:');
        if (appUri !== null && appUri.trim() !== '') {
          const appLabel = prompt('Enter a label for the new app:');
          if (appLabel !== null && appLabel.trim() !== '') {

            const newAppInfo = { '@id': appUri, label: appLabel.trim() };
            // Update di.data
            di.data.push(newAppInfo);

            // Update mainEntity
            di.data[0].mainEntity.app.push(appUri);

            // Add the new app square
            this.addAppSquare(newAppInfo);

          }
        }
      }}
          style="font-size: 2em; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border: none; background-color: transparent;"
        >
          +
        </button>
      </td>
    `;

    return addButtonCell;
  }

  addAppSquare(appInfo) {
    const { appRows } = this.state;
    const index = this.state.mainEntity.app.length;
    const backgroundColor = index % 6 < 3 ? '#e0f2ff' : '#c8e1ff';

    const appCell = html`
      <td
        style="border: 1px solid #ccc; padding: 10px; width: 33%; height: 0; padding-bottom: 20%; position: relative; background-color: ${backgroundColor};"
      >
        <a
          href=${appInfo['@id']}
          target="_blank"
          style="text-decoration: none; color: #1a73e8; font-weight: bold; font-size: 1.2em; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;"
        >
          ${appInfo.label}
        </a>
        <span
          onClick=${(event) => {
        event.preventDefault();
        const newLabel = prompt('Enter a new label:', appInfo.label);
        if (newLabel !== null && newLabel.trim() !== '') {
          appInfo.label = newLabel.trim();
          this.setState({}); // Force a re-render of the component
        }
      }}
          style="position: absolute; top: 5px; right: 5px; cursor: pointer;"
        >
        ✍
        </span>
      </td>
    `;

    if (appRows.length === 0 || appRows[appRows.length - 1].length === 3) {
      appRows.push([appCell]);
    } else {
      appRows[appRows.length - 1].push(appCell);
    }

    this.setState({ appRows });
  }

  render() {
    const { appRows, addButtonCell, uri } = this.state;

    return html`
      <div>
        <table
          style="border-collapse: collapse; width: 80%; margin: 50px auto; font-family: Arial, sans-serif;"
        >
          <tbody>
            ${appRows.map((row) => html`
              <tr>${row}</tr>
            `)}
            <tr>${addButtonCell}</tr>
          </tbody>
        </table>
        <div style="text-align: center; margin: 20px auto; ">
          <button onClick=${() => { this.updateThis() }}>Update this</button> <a style="text-decoration: none;" target="_blank" href=${uri}>🔗</a>
        </div>
      </div>
    `;
  }
}

render(html`<${App} />`, document.body);
