function createMultiselectTags(selector, tags) {

  let multilist = $(selector);

  multilist.select2({
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
        newTag: true,
        score: 0
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

      if (multilist.lastSearch !== term.term) {
        multilist.lastSearch = term.term;
        let tags = [];

        $('option', multilist)
          .each(function (index) {
            tags.push({
              id: $(this).attr("value"),//TODO:val() throw Cannot read properties of undefined (reading 'toLowerCase')
              text: $(this).text()
            });
          });

        const fuse = new Fuse(tags, options)

        multilist.searchedRows = fuse.search(term.term);
      }

      let find = multilist.searchedRows.find(el => el.item.id === text.id);
      if (find) {
        text.score = find.score;
        return text;
      }

      return null;
    },
    sorter: (data) => {
      return data.filter(function (item) {
        return !!item;
      }).sort((a, b) => {
        let score = b.score < a.score
          ? 1
          : (b.score > a.score) ? -1 : 0;

        return score ? score : (a.text.localeCompare(b.text));
      });
    }
  });
}