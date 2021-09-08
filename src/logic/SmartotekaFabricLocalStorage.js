let KnowledgeType = {
  Usefull: 1,
  Preserved: 2,
}

class SmartotekaFabricLocalStorage {
  #getSmartoteka() {
    let smartotekaStr = localStorage.Smartoteka

    let smartoteka = {}

    if (smartotekaStr) {
      smartoteka = JSON.parse(smartotekaStr)
    } else {
      console.log('Add smartoteka')
      smartoteka = {}

      this.#save(smartoteka)
    }

    return smartoteka
  }

  #save(smartoteka) {
    localStorage.setItem('Smartoteka', JSON.stringify(smartoteka))
  }

  queriesProvider() {
    let parent = this

    class SmartotekaQueryManager {
      search(query) {
        let promise = new Promise((resolve, reject) => {
          let smartoteka = parent.#getSmartoteka()

          let searchResults = smartoteka[query]

          resolve(searchResults)
        })

        return promise
      }
    }

    return new SmartotekaQueryManager()
  }

  KBManager() {
    let parent = this

    class SmartotekaManager {
      add(query, content) {
        let smartoteka = parent.#getSmartoteka()

        let queryLinks = smartoteka[query]

        if (!queryLinks) {
          queryLinks = smartoteka[query] = [content]
        } else if (queryLinks.indexOf(content) < 0) queryLinks.push(content)

        parent.#save(smartoteka)
      }

      remove(query, answer) {
        let smartoteka = parent.#getSmartoteka()

        let queryLinks = smartoteka[query]

        if (queryLinks) {
          const index = queryLinks.indexOf(answer)
          if (index > -1) {
            queryLinks.splice(index, 1)

            if (queryLinks.length === 0) {
              smartoteka[query] = null
            }
          }

          parent.#save(smartoteka)
        }

        return new Promise(resolve => resolve())
      }
    }

    return new SmartotekaManager()
  }
}

export default SmartotekaFabricLocalStorage
