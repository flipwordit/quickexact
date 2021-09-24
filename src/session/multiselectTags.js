function createMultiselectTags(selector, tags){
    
    $(selector).select2({
    width: '100%',
    multiple: true,
    tags: true,
    placeholder: "Click here and start typing to search.",
    data: tags,
    createTag: function (params) {
      var term = $.trim(params.term);

      if (term === '') {
        return null;
      }

      return {
        id: term,
        text: term,
        newTag: true // add additional parameters
      }
    },
    insertTag: function (data, tag) {
      // Insert the tag at the end of the results
      data.push(tag);
    },
    matcher: (term, text) => {
      if (term.term === undefined) {
        text.score = 1;
        return text;
      }

      const options = {
        includeScore: true,
        useExtendedSearch: true,
        keys: ['text']
      }

      const fuse = new Fuse([text], options)

      let searchedRows = fuse.search(term.term);

      if (searchedRows[0]) {
        text.score = searchedRows[0].score;
        return text;
      }

      return null;
    },
    sorter: (data) => {
      return data.filter(function (item) {
        return !!item;
      }).sort((a, b) => {
        let score = b.score - a.score;

        return score ? score : (a.text.localeCompare(b.text));
      });
    }
  });
}