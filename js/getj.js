export default async function getj (uri) {
  try {
    const response = await fetch(uri)
    const html = await response.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const script = doc.querySelector(
      '[type="application/ld+json"], [type="application/json"]'
    )

    if (!script) {
      throw new Error('Script tag not found.')
    }

    const jsonArray = JSON.parse(script.textContent)
    const fragId = uri.split('#').pop()

    const found = findNestedObjectById(jsonArray, fragId)

    if (fragId && found) {
      return found
    } else {
      return jsonArray
    }
  } catch (err) {
    throw new Error(`Could not getj: ${err}`)
  }
}

export function findNestedObjectById (objects, id) {
  if (objects === null || typeof objects !== 'object') {
    return null
  }

  if (objects.id === id || objects['@id'] === id) {
    return objects
  }

  if (Array.isArray(objects)) {
    for (const obj of objects) {
      const result = findNestedObjectById(obj, id)
      if (result) {
        return result
      }
    }
  } else {
    for (const key in objects) {
      const child = objects[key]
      if (typeof child === 'object' || Array.isArray(child)) {
        const result = findNestedObjectById(child, id)
        if (result) {
          return result
        }
      }
    }
  }

  return null
}
