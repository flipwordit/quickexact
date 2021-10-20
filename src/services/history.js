import browser from 'webextension-polyfill'
import { fromEventPattern } from 'rxjs'

export default {
  async search(text) {
    const history = await browser.history.search({ text })
    return history
  },
  removedStream: fromEventPattern(
    (handler) => chrome.history.onVisitRemoved.addListener(handler),
    (handler) => chrome.history.onVisitRemoved.removeListener(handler),
  ),
}
