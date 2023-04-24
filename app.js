import { html, Component, render } from './js/spux.js'
import { getPath, getQueryStringValue, loadFile, saveFile } from './util.js'
import { findNestedObjectById } from './js/linkedobjects.js'
import './js/dior.js'


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
      page = await this.getj(uri);
    }

    const data = di.data;
    const mainEntity = page?.[0]?.mainEntity || data[0].mainEntity;

    const appRows = this.createAppRows(mainEntity.app, data);
    const addButtonCell = this.createAddButtonCell();

    this.setState({ uri, data, mainEntity, appRows, addButtonCell });
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
          }
        }}
            style="position: absolute; top: 5px; right: 5px; cursor: pointer;"
          >
          🔗
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
        }
      }}
          style="position: absolute; top: 5px; right: 5px; cursor: pointer;"
        >
          &#9998;
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
    const { appRows, addButtonCell } = this.state;

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
        <div style="text-align: center; margin: 20px auto;">
          <button onClick=${() => { }}>Update this</button>
        </div>
      </div>
    `;
  }
}

render(html`<${App} />`, document.body);
