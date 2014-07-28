/*
 * Extended Image Block
 * 2014 Ændrew Rininsland <aendrew.rininsland@the-times.co.uk>
 * Based on neyre/sir-trevor-wp's ImageCaption.js block.
 */
SirTrevor.Blocks.ImageExtended = SirTrevor.Blocks.Image.extend({

  type: "image_extended",
  title: function() { return i18n.t('blocks:image:title'); },

  droppable: true,
  uploadable: true,

  icon_name: 'image',

  loadData: function(data){
    // Create our image tag
    this.$editor.html($('<img>', { src: data.file.url })).show();
    this.$editor.append($('<input>', {type: 'text', class: 'st-input-string js-caption-input', name: 'caption', placeholder: 'Caption', style: 'width: 100%; margin-top:10px; text-align: center;', value: data.caption}));
    this.$editor.append($('<input>', {type: 'text', class: 'st-input-string js-source-input', name: 'source', placeholder: 'Source', style: 'width: 100%; margin-top:10px; text-align: center;', value: data.source}));
    this.$editor.append($('<label for="js-lightbox-input">Lightbox?</label>'));
    this.$editor.append($('<input>', {type: 'checkbox', class: 'st-input-boolean js-lightbox-input', name: 'lightbox', style: '', value: data.lightbox}));
    this.$editor.append($('<label for="js-stretch-input">Stretch?</label>'));
    this.$editor.append($('<input>', {type: 'checkbox', class: 'st-input-boolean js-stretch-input', name: 'stretch', style: '', value: data.stretch}));
  },

  onBlockRender: function(){
    /* Setup the upload button */
    this.$inputs.find('button').bind('click', function(ev){ ev.preventDefault(); });
    this.$inputs.find('input').on('change', _.bind(function(ev){
      this.onDrop(ev.currentTarget);
    }, this));
  },

	onDrop: function(transferData){
	  var file = transferData.files[0],
	      urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

	  // Handle one upload at a time
	  if (/image/.test(file.type)) {
	    this.loading();
	    // Show this image on here
	    this.$inputs.hide();
	    this.loadData({file: {url: urlAPI.createObjectURL(file)}});

	    this.uploader(
	      file,
	      function(data) {
	        this.setData(data);
	        this.ready();
	      },
	      function(error){
	        this.addMessage(i18n.t('blocks:image:upload_error'));
	        this.ready();
	      }
	    );
	  }
	}

});

SirTrevor.Blocks.Gettyimages = (function(){

  return SirTrevor.Block.extend({

    provider: {
      regex: /embed\.gettyimages\.com\/embed\/(.+)" width/,
      html: "<div style=\"text-align:center;\"><iframe src=\"//embed.gettyimages.com/embed/{{remote_id}}\" width=\"594\" height=\"465\" frameborder=\"0\" scrolling=\"no\"></iframe></div>"
    },

    type: 'gettyimages',
    title: 'GettyImages',

    pastable: true,

    paste_options: {
      html: "<div style=\"text-align:center; padding:20px;\">Enter <b>GettyImages</b> embed code<br /><input type=\"text\" class=\"st-paste-block\" style=\"width: 100%\"></div>"
    },

    icon_name: 'image',

    loadData: function(data) {

      var embed_string = this.provider.html
        .replace('{{remote_id}}', data.remote_id);

      this.$editor.html(embed_string);
    },

    onContentPasted: function(event){
      this.handleDropPaste($(event.target).val());
    },

    handleDropPaste: function(url){
      var match, data;

      match = this.provider.regex.exec(url);

      if (match !== null && !_.isUndefined(match[1])) {
        data = {
          remote_id: match[1]
        };

        this.setAndLoadData(data);
      }
    },

    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleDropPaste(url);
    }
  });

})();

SirTrevor.Blocks.Code = SirTrevor.Block.extend({

	type: "code",

	title: function() { return 'Code'; },

	editorHTML: '<pre class="st-required st-text-block" style="text-align: left; font-size: 0.75em;" contenteditable="true"></pre><input type=text class="st-input-string js-caption-input" name=caption placeholder="Caption" style="width: 100%; margin-top: 10px; text-align: center">',

	icon_name: 'quote',

	loadData: function(data){
		this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
	}
});

SirTrevor.Blocks.Slideshare = (function(){

  return SirTrevor.Block.extend({

    provider: {
      regex: /slideshare id=(.+)&doc/,
      html: "<iframe src=\"http://www.slideshare.net/slideshow/embed_code/{{remote_id}}?rel=0\" width=\"425\" height=\"355\" frameborder=\"0\" marginwidth=\"0\" marginheight=\"0\" scrolling=\"no\" style=\"border:1px solid #CCC; border-width:1px 1px 0; margin-bottom:5px; max-width: 100%;\" allowfullscreen> </iframe>"
    },

    type: 'slideshare',
    title: 'SlideShare',

    pastable: true,

    paste_options: {
      html: "<div style=\"text-align:center; padding:20px;\">Enter <b>Slideshare</b> code for Wordpress.com blogs (ex: [slideshare id=...)<br /><input type=\"text\" class=\"st-paste-block\" style=\"width: 100%\" placeholder=\"Enter code for Wordpress\"></div>"
    },

    icon_name: 'iframe',

    loadData: function(data) {

      this.$editor.addClass('st-block__editor--with-square-media');

      var embed_string = this.provider.html
        .replace('{{remote_id}}', data.remote_id);

      this.$editor.html(embed_string);
    },

    onContentPasted: function(event){
      this.handleDropPaste($(event.target).val());
    },

    handleDropPaste: function(url){
      var match, data;

      match = this.provider.regex.exec(url);

      if (match !== null && !_.isUndefined(match[1])) {
        data = {
          remote_id: match[1]
        };

        this.setAndLoadData(data);
      }
    },

    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleDropPaste(url);
    }
  });

})();

// Adds a Caption Field to the Image Block
(function ($){
	SirTrevor.Blocks.ImageWithCaption = SirTrevor.Block.extend({

		type: "image",
		title: function() { return 'Image' },

		droppable: true,
		uploadable: true,

		icon_name: 'image',

		loadData: function(data){
		  this.$editor.html($('<img>', { src: data.file.url })).show();
		  this.$editor.append($('<input>', {type: 'text', class: 'st-input-string js-caption-input', name: 'text', placeholder: 'Caption', style: 'width: 100%; margin-top:10px; text-align: center;', value: data.text}));
		},

		onBlockRender: function(){
		  /* Setup the upload button */
		  this.$inputs.find('button').bind('click', function(ev){ ev.preventDefault(); });
		  this.$inputs.find('input').on('change', _.bind(function(ev){
		    this.onDrop(ev.currentTarget);
		  }, this));
		},

		onDrop: function(transferData){
		  var file = transferData.files[0],
		      urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

		  // Handle one upload at a time
		  if (/image/.test(file.type)) {
		    this.loading();
		    // Show this image on here
		    this.$inputs.hide();
		    this.loadData({file: {url: urlAPI.createObjectURL(file)}});

		    this.uploader(
		      file,
		      function(data) {
		        this.setData(data);
		        this.ready();
		      },
		      function(error){
		        this.addMessage(i18n.t('blocks:image:upload_error'));
		        this.ready();
		      }
		    );
		  }
		}
	});
}(jQuery));

/*
  Simple Table
*/
//https://github.com/jbaiter/sir-trevor-js/compare/gruntwebfont...tableblock
SirTrevor.Blocks.Table = (function() {

  var template =  '<table>' +
                    '<caption contenteditable></caption>' +
                    '<thead>' +
                      '<tr>' +
                        '<th contenteditable></th>' +
                        '<th contenteditable></th>' +
                      '</tr>' +
                    '</thead>' +
                  '<tbody>' +
                    '<tr>' +
                        '<td contenteditable></td>' +
                        '<td contenteditable></td>' +
                      '</tr>' +
                    '</tbody>' +
                  '</table>';

  function addCell(row, cellTag) {
    var tag_template = _.template("<<%= tag %>>");
    if (cellTag === undefined) {
      cellTag = tag_template(
        { tag: $(row).children().first().prop('tagName').toLowerCase() }
      );
    }
    $(row).append($(cellTag, {contenteditable: true}));
  };

  function addColumnHandler(ev) {
    ev.preventDefault();
    this.$table.find('tr').each(function () { addCell(this); });
  };

  function deleteColumnHandler(ev) {
    ev.preventDefault();
    this.$table.find('tr').each(function () {
      if ($(this).children().length > 1) {
          $(this).children().last().remove();
      }
    });
  };

  function addRowHandler(ev) {
    var row = $("<tr>");
    ev.preventDefault();
    this.$table.find('th').each(function () {
        addCell(row, "<td>");
    });
    this.$table.find('tbody').append(row);
  };

  function deleteRowHandler(ev) {
    ev.preventDefault();
    if (this.$table.find('tbody tr').length > 1) {
      this.$table.find('tbody tr:last').remove();
    }
  };

  return SirTrevor.Block.extend({

    type: 'table',
    title: function() { return i18n.t('blocks:table:title'); },

    controllable: true,
    controls: {
      'addrow': addRowHandler,
      'delrow': deleteRowHandler,
      'addcol': addColumnHandler,
      'delcol': deleteColumnHandler
    },

    icon_name: 'table',

    editorHTML: function() {
      var editor_template = '<div class="st-text-block">' + template + '</div>';
      return _.template(editor_template, this);
    },

    onBlockRender: function() {
      this.$table = this.getTextBlock().find('table');
    },

    loadData: function(data){
      this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
    },

    toMarkdown: function(html) {
      function rowToMarkdown(row) {
        var cells = $(row).children(),
            md = cells.map(function() { return $(this).text(); })
                .get().join(" | ");
        if (cells[0].tagName === 'TH') {
          md += "\n";
          md += cells.map(function() { return "---"; }).get().join(" | ");
        }
        return md;
      }

      var markdown = $(html).find('tr').map(function(){
        return rowToMarkdown(this);
      }).get().join("\n");
      if ($(html).find('caption').text() != "") {
        markdown += "\n[" + $(html).find('caption').text() + "]";
      }
      return markdown;
    },

    toHTML: function(markdown) {
      var html = $('<table><caption contenteditable></caption><thead><tr></tr></thead><tbody></tbody></table>'),
          lines = markdown.split("\n"),
          caption_re = /\[(.*)\]/,
          lastline;
      // Check for caption
      lastline = lines[lines.length-1];
      if (lastline.match(caption_re)) {
        html.find('caption').text(lastline.match(caption_re)[1]);
        lines = lines.slice(0, lines.length-1);
      }
      // Add header row
      _.each(lines[0].split(" | "), function(content) {
        html.find('thead tr').append('<th contenteditable>' + content + '</th>');
      });
      // Add remaining rows
      _.each(lines.slice(2, lines.length), function(line) {
        var row = $('<tr>');
        _.each(line.split(" | "), function(content) {
          row.append('<td contenteditable>' + content + '</th>');
        });
        html.find('tbody').append(row);
      });
      return html[0].outerHTML;
    },

    isEmpty: function() {
      return _.isEmpty(this.saveAndGetData().text);
    }
  });
})();

SirTrevor.Blocks.Embedly = (function(){

  return SirTrevor.Block.extend({

    type: 'Embedly',
    key: 'e17039e0f50c491eac002974d0846733',

    droppable: true,
    pastable: true,
    fetchable: true,

    icon_name: "embed",

    loadData: function(data){
      if (data.html) {
       this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');
       this.$editor.html(data.html);
      } else if (data.type == "photo") {
       this.$editor.html("<img src=\""+data.url+"\" />");
      }
    },

    onContentPasted: function(event){
      var input = $(event.target),
          val = input.val();

      this.handleDropPaste(val);
    },

    handleDropPaste: function(url){
      if(!_.isURI(url)) {
        SirTrevor.log("Must be a URL");
        return;
      }

      this.loading();

      var embedlyCallbackSuccess = function(data) {
        this.setAndLoadData(data);
        this.ready();
      };

      var embedlyCallbackFail = function() {
        this.ready();
      };

      var ajaxOptions = {
        url: this.buildAPIUrl(url),
        dataType: "jsonp"
      };

      this.fetch(ajaxOptions,
                 _.bind(embedlyCallbackSuccess, this),
                 _.bind(embedlyCallbackFail, this));
    },

    buildAPIUrl: function(url) {
      return "//api.embed.ly/1/oembed?key=" + this.key + "&url=" + escape(url);
      // return "//iframely.com/iframely?url=" + escape(url);
    },

    onDrop: function(transferData){
      this.handleDropPaste(transferData.getData('text/plain'));
    }

  });

})();

SirTrevor.Blocks.Gist = (function(){

  return SirTrevor.Block.extend({

    type: "Gist",
    droppable: true,
    pastable: true,
    fetchable: true,

    loadData: function(data) {
      this.loadRemoteGist(data.id);
    },

    onContentPasted: function(event){
      // Content pasted. Delegate to the drop parse method
      var input = $(event.target),
          val = input.val();

      this.handleGistDropPaste(val);
    },

    handleGistDropPaste: function(url) {
      if (!this.validGistUrl(url)) {
        this.addMessage("Invalid Gist URL");
        return;
      }

      var gistID = url.match(/[^\/]+$/);
      if (!_.isEmpty(gistID)) {
        gistID = gistID[0];
        this.loading();
        this.setData({ id: gistID });
        this.loadRemoteGist(gistID);
      }
    },

    validGistUrl: function(url) {
      return (_.isURI(url) &&
              url.indexOf("gist.github") !== -1);
    },

    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleGistDropPaste(url);
    },

    loadRemoteGist: function(gistID) {
      var ajaxOptions = {
        url: "//gist.github.com/" + gistID + ".json",
        dataType: "jsonp"
      };

      this.fetch(ajaxOptions, this.onGistFetchSuccess, this.onGistFetchFail);
    },

    onGistFetchSuccess: function(data) {
      // And render
      $('head').append('<link rel="stylesheet" href="//gist.github.com'+data.stylesheet+'" type="text/css">');

      this.$inputs.hide();
      this.$editor.html(data.div).show();
      this.ready();
    },

    onGistFetchFail: function() {
      this.addMessage("There was a problem fetching your Gist");
      this.ready();
    }

  });

})();

/*
 Heading Block
 */
SirTrevor.Blocks.HeadingExtended = (function() {

    function setLevel(block, lev) {
        block.heading_level = lev;
        //console.log( 'setLevel( ' + lev + ' ) -> ' +lev+'+'+block.level_modifier );
        lev = parseInt(lev) + parseInt(block.level_modifier);
        $('#'+block.heading_id).replaceWith(function() {
            return '<h' + lev + ' id="' + block.heading_id + '" contenteditable="true">' +
                $(this).text() +
                '</h' + lev + '>';
        });
    }

    function setLevel_1(ev) {
        ev.preventDefault();
        //console.log( 'setLevel_1' );
        setLevel(this, 1);
//        $('#'+this.heading_id).replaceWith(function() {
//            return '<h1>' + $(this).text() + '</h1>';
//        })
    }

    function setLevel_2(ev) {
        ev.preventDefault();
        //console.log( 'setLevel_2' );
        setLevel(this, 2);
    }

    function setLevel_3(ev) {
        ev.preventDefault();
        //console.log( 'setLevel_3' );
        setLevel(this, 3);
    }

    function setLevel_4(ev) {
        ev.preventDefault();
        //console.log( 'setLevel_4' );
        setLevel(this, 4);
    }

    return SirTrevor.Block.extend({

    level_modifier: 1, // all level output is one level higher, e. g. h1 -> h2

    type: 'heading_extended',

    //title: function(){ return i18n.t('blocks:heading:title'); },
    title: function(){ return 'heading2'; },

    editorHTML: function() {
        this.heading_id = _.uniqueId('js-heading-');
        this.heading_level = 1;
        this.heading_text = 'text';
        //console.log('heading_id: ' + this.heading_id);
        return '<div class="st-text-block--heading" >' + //st-required st-text-block
            '<h1 id="' + this.heading_id + '" contenteditable="true">text' +
            '</h1></div>';
    },

    controllable: true,
    controls: {
        'h1': setLevel_1,
        'h2': setLevel_2,
        'h3': setLevel_3,
        'h4': setLevel_4
    },

    icon_name: 'heading',

    loadData: function(data){
        //console.log('HeadingExtended - loadData');
        //console.log( 'HeadingExtended - loadData level=' + data.level );
        //console.log( 'HeadingExtended - loadData text=' + data.text );
        this.heading_level = data.level;
        this.heading_text = data.text;
        //this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
        $('#'+this.heading_id).text(this.heading_text);
        setLevel(this, this.heading_level);
        //console.log('HeadingExtended - loadData -> ' + $('#'+this.heading_id).html());
    },

    beforeBlockRender: function() {
        //console.log('beforeBlockRender');
        //console.log('HeadingExtended - beforeBlockRender -> ' + $('#'+this.heading_id).html());
    },

    onBlockRender: function() {
        //console.log('onBlockRender');
        $('#'+this.heading_id).text(this.heading_text);
        setLevel(this, this.heading_level);
        //console.log('HeadingExtended - onBlockRender -> ' + $('#'+this.heading_id).html());
    },

    toData: function(){
        //console.log('HeadingExtended - toData');
        var dataObj = {};

        dataObj.level = this.heading_level;
        dataObj.text = $('#'+this.heading_id).text();

        //console.log( 'obj level=' + dataObj.level );
        //console.log( 'obj text=' + dataObj.text );

        //console.log('toData - setData');
        this.setData(dataObj);
    }

    });
})();

SirTrevor.Blocks.Columns = (function() {
  return SirTrevor.Block.extend({
    type: "Columns",
    title: function() { return i18n.t('blocks:columns:title'); },
    icon_name: 'columns',

    columns_presets: {
      'columns-6-6': [6,6],
      'columns-3-9': [3,9],
      'columns-9-3': [9,3],
      'columns-4-8': [4,8],
      'columns-8-4': [8,4],
      'columns-4-4-4': [4,4,4],
      'columns-3-6-3': [3,6,3],
      'columns-3-3-3-3': [3,3,3,3]
    },

    controllable: true,

    constructor: function(data, instance_id, sirTrevor) {
      SirTrevor.Block.apply(this, arguments);
    },

    beforeBlockRender: function() {
      this.controls = {
        'twocolumns': this.changeColumnsHandler('columns-6-6'),
        'threecolumns': this.changeColumnsHandler('columns-4-4-4'),
        'onetwocolumns': this.changeColumnsHandler('columns-4-8'),
        'twoonecolumns': this.changeColumnsHandler('columns-8-4'),
        'fourcolumns': this.changeColumnsHandler('columns-3-3-3-3'),
        'onethreecolumns': this.changeColumnsHandler('columns-3-9'),
        'threeonecolumns': this.changeColumnsHandler('columns-9-3'),
        'onetwoonecolumns': this.changeColumnsHandler('columns-3-6-3')
      };
    },

    changeColumnsHandler: function(preset) {
      var self = this;
      return function() { self.changeColumns(preset, false); };
    },

    changeColumns: function(preset) {
      if (this.columns_preset != preset)
      {
        this.applyColumns(preset);
      }
    },

    editorHTML: function() {
      return _.template(
          '<div class="columns-row" id="<%= blockID %>-columns-row" style="overflow: auto"/>'
          , {blockID: this.blockID});
    },

    _setBlockInner: function() {
      SirTrevor.Block.prototype._setBlockInner.apply(this, arguments);
      this.applyColumns('columns-6-6', true); /* default */
    },

    applyColumns: function(preset, initial)
    {
      var self = this;
      var columns_config = this.columns_presets[preset];

      var $to_delete = this.getColumns(':gt('+(columns_config.length-1)+')');
      // if there are unneeded columns
      if ($to_delete.length > 0) {
        // ask confirmation only if there are nested blocks
        if ($to_delete.children('.st-block').length > 0)
        {
          var txt = $to_delete.length == 1 ? 'column' : ($to_delete.length + ' columns');
          if (!confirm('This action will delete last ' + txt + '. Do you really want to proceed?')) {
            return; // interrupt if "Cancel" is pressed
          }
        }
        $to_delete.each(function() {
          var $this = $(this);
          // destroy nested blocks properly
          $this.children('.st-block').each(function() {
            self.sirTrevor.removeBlock(this.getAttribute('id'));
          });
          // destroy column itself
          $this.trigger('destroy').remove();
        });
      }

      // apply new configuration
      var total_width = _.reduce(columns_config, function(total, width){ return total+width; }, 0);
      var $row = this.$('.columns-row');

      _.each(columns_config, function(ratio, i) {
        var width = Math.round(ratio*1000*100/total_width)/1000;

        var $column = self.getColumn(i);
        if ($column.length == 0) {
          $column = $('<div class="column" style="float: left; "></div>');
          var plus = new SirTrevor.FloatingBlockControls($column, self.instanceID);
          self.listenTo(plus, 'showBlockControls', self.sirTrevor.showBlockControls);
          $column.prepend(plus.render().$el);
          $row.append($column);
        }

        $column.css('width', width+'%');
      });

      this.$('.st-block-control-ui-btn').removeClass('active')
          .filter('[data-icon='+preset+']').addClass('active');

      this.columns_preset = preset;

      if (!initial) this.trigger('block:columns:change');
    },

    onBlockRender: function() {
      this.$('.st-block-control-ui-btn').filter('[data-icon='+this.columns_preset+']').addClass('active');
    },

    getRow: function() {
      if (this.$row) return this.$row;
      return this.$row = this.$('#'+this.blockID+'-columns-row');
    },

    getColumns: function(filter) {
      return this.getRow().children(filter);
    },

    getColumn: function(index) {
      return this.getRow().children(':eq('+index+')');
    },

    toData: function() {
      var self = this;
      var column_config = this.columns_presets[this.columns_preset];
      var dataObj = { columns: [], preset: this.columns_preset };

      this.getColumns().each(function(i) {
        var blocksData = [];
        $(this).children('.st-block').each(function(){
          var block = self.sirTrevor.findBlockById(this.getAttribute('id'));
          blocksData.push(block.saveAndReturnData());
        });

        dataObj.columns.push({
          width: column_config[i],
          blocks: blocksData
        });
      });

      this.setData(dataObj);
    },

    loadData: function(data)
    {
      if (data.preset) {
        this.applyColumns(data.preset, true);
      }

      var columns_data = (data.columns || []);
      for (var i=0; i<columns_data.length; i++)
      {
        var $block = null;
        var $column = this.getColumn(i);
        for (var j=0; j<columns_data[i].blocks.length; j++) {
          var block = columns_data[i].blocks[j];
          $block = this.sirTrevor.createBlock(block.type, block.data, $block ? $block.$el : $column.children('.st-block-controls__top'));
        }
      }
    },

    _initUIComponents: function() {
      SirTrevor.Block.prototype._initUIComponents.apply(this, arguments);
    },

    performValidations: function() {
      // nothing
    }
  });
})();

SirTrevor.Blocks.Poll = (function() {

// SirTrevor.Blocks.Poll = SirTrevor.Block.extend({
  var template =  '<a data-type="Heading" class="st-block-control" onclick="console.log($(this));"><span class="st-icon">heading</span>Heading</a>'+
  '<a data-type="Heading" class="st-block-control" onclick="getPollTemplate(\'multi\');"><span class="st-icon">heading</span>Heading</a>'+
  '<a data-type="Heading" class="st-block-control"><span class="st-icon">heading</span>Heading</a>'+
  '<a data-type="Heading" class="st-block-control"><span class="st-icon">heading</span>Heading</a>';


function tagblock(){
	console.log('wassup');
}

function getPollTemplate(type){
	$.get( "/pollster/"+type, function( data ) {
		console.log(data);
		// thisEd.$editor.html(data).show();
	});
}
  function addRowHandler(ev) {
    var row = $("<tr>");
    ev.preventDefault();
    this.$table.find('th').each(function () {
        addCell(row, "<td>");
    });
    this.$table.find('tbody').append(row);
  };


return SirTrevor.Block.extend({

	type: "poll",

	title: function() { return 'Poll'; },
	
	// editorHTML: function() {
      // var editor_template = '<div class="st-text-block">' + template + '</div>';
      // return _.template(editor_template, this);
    // },
	
	// editorHTML: '<script>$(".ghostInput").on(\'click\',function(){$(\'<div class="form-group"><div class="radio-button"><span class="radio-button"></span></div><input type="text" class="form-control multiOption"></div>\').insertBefore(\'#defGhostGroup\');});$(".multiOption:last").keypress(function(e){if(e.which==13 && $(this).val()!==\'\'){$(\'<div class="form-group"><div class="radio-button"><span class="radio-button"></span></div><input type="text" class="form-control multiOption"></div>\').insertBefore(\'#defGhostGroup\');}});</script><style>div#multiContainer{max-height: 400px;overflow-y: auto;}span.radio-button{background: rgba(255, 255, 255, 0);border: 1px solid rgba(198,198,198,1);height: 15px;left: 7px;margin: 0;outline: none;position: absolute;text-align: left;top: 6px;width: 15px;border-bottom-left-radius: 50%;border-bottom-right-radius: 50%;border-top-left-radius: 50%;border-top-right-radius: 50%;}div.radio-button{position:relative;}input.multiOption{margin-left:32px;max-width:400px;}input.ghostInput{margin-left:32px;max-width:400px;opacity:0.5;color:gray;cursor:pointer;}</style><div class="container-fluid" id="multiContainer"><input type="hidden" id="pollType" value="multi"/><div class="form-group"><label for="questionTitle">Question Title</label><input type="text" class="form-control" id="questionTitle" placeholder="ex. What is your favorite food?"></div><div class="form-group"><label>Options</label><div class="radio-button"><span class="radio-button"></span></div><input type="text" class="form-control multiOption"></div><div class="form-group" id="defGhostGroup"><div class="radio-button"><span class="radio-button"></span></div><input type="text" class="form-control ghostInput" placeholder="Click to add an option"></div></div>',

	  // loadData: function(data){
	    // // Create our image tag
	    // this.$editor.html($('<img>', { src: data.file.url })).show();
	    // this.$editor.append($('<input>', {type: 'text', class: 'st-input-string js-caption-input', name: 'caption', placeholder: 'Caption', style: 'width: 100%; margin-top:10px; text-align: center;', value: data.caption}));
	    // this.$editor.append($('<input>', {type: 'text', class: 'st-input-string js-source-input', name: 'source', placeholder: 'Source', style: 'width: 100%; margin-top:10px; text-align: center;', value: data.source}));
	    // this.$editor.append($('<label for="js-lightbox-input">Lightbox?</label>'));
	    // this.$editor.append($('<input>', {type: 'checkbox', class: 'st-input-boolean js-lightbox-input', name: 'lightbox', style: '', value: data.lightbox}));
	    // this.$editor.append($('<label for="js-stretch-input">Stretch?</label>'));
	    // this.$editor.append($('<input>', {type: 'checkbox', class: 'st-input-boolean js-stretch-input', name: 'stretch', style: '', value: data.stretch}));
	  // },
// 	
	  // onBlockRender: function(){
	    // /* Setup the upload button */
	    // this.$inputs.find('button').bind('click', function(ev){ ev.preventDefault(); });
	    // this.$inputs.find('input').on('change', _.bind(function(ev){
	      // this.onDrop(ev.currentTarget);
	    // }, this));
	  // },

	icon_name: 'poll',

    // paste_options: {
      // // String; (can use underscore template tags)
      // // Defines the HTML for the paste template
      // html: '<script>$(".ghostInput").on(\'click\',function(){$(\'<div class="form-group"><div class="radio-button"><span class="radio-button"></span></div><input type="text" class="form-control multiOption"></div>\').insertBefore(\'#defGhostGroup\');});$(".multiOption:last").keypress(function(e){if(e.which==13 && $(this).val()!==\'\'){$(\'<div class="form-group"><div class="radio-button"><span class="radio-button"></span></div><input type="text" class="form-control multiOption"></div>\').insertBefore(\'#defGhostGroup\');}});</script><style>div#multiContainer{max-height: 400px;overflow-y: auto;}span.radio-button{background: rgba(255, 255, 255, 0);border: 1px solid rgba(198,198,198,1);height: 15px;left: 7px;margin: 0;outline: none;position: absolute;text-align: left;top: 6px;width: 15px;border-bottom-left-radius: 50%;border-bottom-right-radius: 50%;border-top-left-radius: 50%;border-top-right-radius: 50%;}div.radio-button{position:relative;}input.multiOption{margin-left:32px;max-width:400px;}input.ghostInput{margin-left:32px;max-width:400px;opacity:0.5;color:gray;cursor:pointer;}</style><div class="container-fluid" id="multiContainer"><input type="hidden" id="pollType" value="multi"/><div class="form-group"><label for="questionTitle">Question Title</label><input type="text" class="form-control" id="questionTitle" placeholder="ex. What is your favorite food?"></div><div class="form-group"><label>Options</label><div class="radio-button"><span class="radio-button"></span></div><input type="text" class="form-control multiOption"></div><div class="form-group" id="defGhostGroup"><div class="radio-button"><span class="radio-button"></span></div><input type="text" class="form-control ghostInput" placeholder="Click to add an option"></div></div>'
    // },

	
	beforeBlockRender: function() {console.log('rendered');},

	onBlockRender: function() {
		var thisEd=this;
		console.log(thisEd);
		$.get( "/pollster/multi", function( data ) {
			thisEd.$editor.html(data).show();
		});

		// this.$editor.html($('<div>', {})).show();
	    // this.$editor.append($('<input>', {type: 'button',onclick:'$(this).makeReal()', class: 'st-input-string js-caption-input', name: 'caption', placeholder: 'Caption', style: 'width: 100%; margin-top:10px; text-align: center;'}));

	},	 

    toData: function(){

        var dataObj = {};
		dataObj.question=this.$editor.find(".pollster-question").val();
		dataObj.pollType=this.$editor.find(".pollType").val();
		dataObj.pollOptions=[];
		this.$editor.find("input.poll-option").each(function(i,elem){
			dataObj.pollOptions.push({
				label:$(this).val(),
				value:i
			});
		});
		
		console.log(dataObj);



												// optValue:$(this).children('input').first().attr('value'),
										// label:$(this).children('.inputLabel').first().html()};

        //console.log( 'obj level=' + dataObj.level );
        //console.log( 'obj text=' + dataObj.text );

        //console.log('toData - setData');
        this.setData(dataObj);
    },
	
	controllable: true,
    controls: {
        '\#': tagblock,
        '\^': tagblock,
        '\@': tagblock,
    },
	 
	loadData: function(data){
		this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
	}
});
})();

