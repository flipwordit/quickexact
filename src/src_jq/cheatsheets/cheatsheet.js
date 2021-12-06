import createCheatSheetsGrid from './cheatsheetGrid'
import { getSmartotekaFabric, unique } from '@/src_jq/common/commonFunctions'
import {
  getFilterByTags, registerFilterToGrid, select2ClearTags, select2UpdateTags,
  generateAdditionalTagsFunction,
} from '@/src_jq/common/mulitselectTagsHandlers'
import createMultiselectTags from '@/src_jq/common/multiselectTags'

let smartotekaFabric = getSmartotekaFabric()

$(function () {
  let cheatSheetsGrid = createCheatSheetsGrid('#cheatSheetsGrid', getFilterByTags())

  function getSelectedCheatSheets() {
    let selectedRows = cheatSheetsGrid.api.getSelectedRows()

    return selectedRows
  }

  function clearAddBlockState() {
    $('#add-content').val(null)
    $('#add-btn').text('Add')
    $('#copy-btn').hide()
  }

  let addUpdateHandler = null

  cheatSheetsGrid.onSelectionChanged = function () {
    let cheatSheets = getSelectedCheatSheets()

    if (cheatSheets.length === 1) {
      $('#add-content').show()
      $('#add-btn').text('Update')
      $('#copy-btn').show()

      let selectedCheatSheet = cheatSheets[0]

      $('#add-content').val(selectedCheatSheet.content)

      select2UpdateTags('#add-tags', selectedCheatSheet.tags)

      // update, copy
      addUpdateHandler = (cheatSheet, isUpdate) => {
        if (isUpdate) {
          // eslint-disable-next-line no-param-reassign
          cheatSheet.date = selectedCheatSheet.date// Set id for update

          smartotekaFabric.KBManager()
            .updateCheatSheets([cheatSheet])
            .then(() => {
              cheatSheetsGrid.api.applyTransaction(
                { update: [cheatSheet] },
              )

              clearAddBlockState()
            })
        } else {
          smartotekaFabric.KBManager()
            .addCheatSheet(cheatSheet)
            .then(() => {
              cheatSheetsGrid.api.applyTransaction(
                { add: [cheatSheet] },
              )

              let addedNode = cheatSheetsGrid.api.getFilteredRows(node => node.data.date === cheatSheet.date)

              if (addedNode.length) {
                addedNode[0].setSelected(true, true)
              } else {
                clearAddBlockState()
              }
            })
        }
      }
    } else if (cheatSheets.length > 1) {
      // group update. Only tags
      $('#add-content').hide()

      $('#add-btn').text('Group add tags')

      let commonTags = joinArrays(cheatSheets.map(el => el.tags), el => el.text)

      select2UpdateTags('#add-tags', commonTags)

      addUpdateHandler = (cheatSheet) => {
        let removedTags = commonTags.filter(ct => cheatSheet.tags.findIndex(t => t.id === ct.id) === -1)

        cheatSheets.forEach(el => {
          el.tags = el.tags.filter(ct => removedTags.findIndex(t => t.id === ct.id) === -1)

          el.tags = mergeArraysById(cheatSheet.tags, el.tags, el => el.text)
        })

        console.log(cheatSheets)

        smartotekaFabric.KBManager().updateCheatSheets(cheatSheets)
          .then(() => {
            $('#add-content').show()

            cheatSheetsGrid.api.applyTransaction({
              update: cheatSheets,
            })

            $('#add-content').val(null)
            $('#add-btn').text('Add')
          })
      }
    }
  }

  cheatSheetsGrid.onDeleting = (cheatSheet) => new Promise(resolve => {
    smartotekaFabric.KBManager().deleteCheatSheet(cheatSheet)
      .then(_ => resolve())
  })

  function handleCheatSheets(cheatSheets) {
    let oldCheatSheets = []
    cheatSheetsGrid.api.forEachNode(node => {
      if (node.data) { oldCheatSheets.push(node.data) }
    })

    let newRows = cheatSheets.filter(t => oldCheatSheets.findIndex(ot => ot.id === t.id) < 0)
    let removeRows = oldCheatSheets.filter(ot => cheatSheets.findIndex(t => ot.id === t.id) < 0)
    let updateRows = cheatSheets.filter(t => oldCheatSheets.findIndex(ot => ot.id === t.id) >= 0)

    cheatSheetsGrid.api.applyTransaction({
      add: newRows,
      remove: removeRows,
      update: updateRows,
    })
  }

  function refreshCheatSheetsGrid(cheatSheets) {
    if (cheatSheets) {
      handleCheatSheets(cheatSheets)
    } else {
      smartotekaFabric.queriesProvider().getCheatSheets()
        .then((requestedCheatSheets) => {
          handleCheatSheets(requestedCheatSheets)
        })
    }
  }

  refreshCheatSheetsGrid()

  $('#load-btn').click(_ => {
    refreshCheatSheetsGrid()
  })

  function clearFilters() {
    cheatSheetsGrid.api.setFilterModel(null)
  }

  $('#clear-filter-btn').click(_ => clearFilters())

  $('#add-btn,#copy-btn').click(function () {
    let dateCreation = new Date().valueOf()

    let selectedTags = $('#add-tags')
      .select2('data')

    let newTags = selectedTags
      .filter(el => el.newTag)
      .map(el => ({ id: el.id, text: el.text }))

    smartotekaFabric.KBManager().addTags(newTags)
      .then(_ => {
        newTags.forEach(el => {
          let newOption = new Option(el.text, el.id, false, false)
          $('#add-tags').append(newOption)
        })

        select2ClearTags('#add-tags')
      })

    let tagsToCheatSheet = selectedTags
      .map(el => ({ id: el.id, text: el.text }))

    let cheatsheet = {
      date: dateCreation,
      content: $('#add-content').val(),
      tags: unique(tagsToCheatSheet, el => el.id),
    }

    if (addUpdateHandler !== null) {
      addUpdateHandler(cheatsheet, $(this).attr('id') === 'add-btn')

      addUpdateHandler = null
    } else {
      smartotekaFabric.KBManager().addCheatSheet(cheatsheet)
        .then(() => {
          $('#add-content').val(null)

          cheatSheetsGrid.api.applyTransaction({
            add: [cheatsheet],
          })
        })
    }
  })

  smartotekaFabric.queriesProvider().getTags().then(tags => {
    let generateAdditionalTags = generateAdditionalTagsFunction(() => cheatSheetsGrid.api.getFilteredRows())

    createMultiselectTags('#add-tags', tags, generateAdditionalTags)
    createMultiselectTags('#filter-tags', tags, generateAdditionalTags)
  })

  registerFilterToGrid(cheatSheetsGrid)
})
