import getj from './js/getj'
import './js/dior.js'


export function getQueryStringValue(key) {
  const queryString = window.location.search.substring(1)
  const queryParams = new URLSearchParams(queryString)
  return queryParams.get(key)
}

console.log(9)
const uri = getQueryStringValue('uri')
console.log('uri', uri)
if (uri) {
  globalThis.page = await getj(uri)
  console.log('page', page)
}

console.log('DOMContentLoaded')
const data = di.data
const mainEntity = page[0].mainEntity || data[0].mainEntity

const table = document.createElement('table')
table.setAttribute('style', 'border-collapse: collapse; width: 80%; margin: 50px auto; font-family: Arial, sans-serif;')

const tableBody = document.createElement('tbody')

let appRow
mainEntity.app.forEach((appUrl, index) => {
  if (index % 3 === 0) {
    appRow = document.createElement('tr')
    tableBody.appendChild(appRow)
  }

  const appInfo = data.find((item) => item['@id'] === appUrl)

  const appCell = document.createElement('td')
  const backgroundColor = index % 6 < 3 ? '#e0f2ff' : '#c8e1ff'
  appCell.setAttribute('style', `border: 1px solid #ccc; padding: 10px; width: 33%; height: 0; padding-bottom: 20%; position: relative; background-color: ${backgroundColor};`)

  const appLink = document.createElement('a')
  appLink.href = appInfo['@id']
  appLink.target = '_blank'
  appLink.textContent = appInfo.label
  appLink.setAttribute('style', 'text-decoration: none; color: #1a73e8; font-weight: bold; font-size: 1.2em; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;')

  appCell.appendChild(appLink)
  appRow.appendChild(appCell)
})

table.appendChild(tableBody)
document.body.appendChild(table)
