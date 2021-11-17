/**
 * @ngdoc service
 * @name miller.services
 * @description
 * # core
 * Resource REST API service Factory.
 */
angular.module('miller')
  .service('parseHeaderFilename', function() {
    return function(headers) {
      var header = headers('content-disposition');
      var result = header.split(';')[1].trim().split('=')[1];
      return result.replace(/"/g, '');
    }
  })
  /*
    auth factory.
  */
  .factory('AuthFactory', function ($resource) {
    return $resource('/auth/:fn/', {},{
      login: {
        method: 'POST',
        params:{
          fn: 'login'
        }
      },
      register: {
        method: 'POST',
        fn: 'register'
      }
    });
  })

  .factory('CrossRefFactory', function($http){
    return {
      search: function(query, page, rows){
        return $http.get('http://search.crossref.org/dois',{
          params:{
            q: query,
            header:'true',
            page: page || 1,
            rows: rows || 8
          }
        });
      }
    }
  })

  /*
    Get a list of stories
  */
  .factory('StoryFactory', function ($resource, parseHeaderFilename) {
    return $resource('/api/story/:id/:fn/', {},{
      update: {
        method:'PUT'
      },
      publish: {
        method: 'POST',
        params:{fn:'publish'},
      },
      search: {
        method: 'GET',
        params:{fn:'search'},
      },
      patch: {
        method:'PATCH'
      },
      getComments: {
        params:{fn:'comments'},
        method: 'GET',
      },
      featured: {
        params:{fn:'featured'},
        method: 'GET'
      },
      getNeighbors: {
        params:{fn:'neighbors'},
        method: 'GET'
      },

      pending: {
        params:{fn:'pending'},
        method: 'GET'
      },
      download: {
        params:{fn:'download'},
        method: 'GET',
        responseType: 'arraybuffer',
        transformResponse: function(data, headers) {
          return {
            data: data,
            filename: parseHeaderFilename(headers)
          }
        }
      }
    });
  })
  .factory('StoryDOIMetadataFactory', function ($resource) {
    return $resource('/api/story/:id/doi/:fn/', {},{
      getMetadata: {
        method: 'GET',
        params: {fn: 'metadata'}
      },
      updateMetadata: {
        method: 'POST',
        params: {fn: 'metadata'}
      }
    })
  })
  .factory('StoryGitFactory', function ($resource, parseHeaderFilename) {
    return $resource('/api/story/:id/git/:fn/:commit/', {},{
      getByGitTag: {
        params: {
          fn:'tag'
        },
        method: 'GET',
      },
      getDiff:{
        params: {
          fn:'diff'
        },
        method: 'GET',
      },
      saveVersion:{
        params: {
          fn: 'tag'
        },
        method: 'POST'
      }
    })
  })
  .factory('StoryTagsFactory', function ($resource) {
    return $resource('/api/story/:id/tags/', {},{
      update: {
        method:'PUT'
      }
    });
  })
  .factory('StoryDocumentsFactory', function ($resource) {
    return $resource('/api/story/:id/documents/', {},{
      update: {
        method:'PUT'
      }
    });
  })
  .factory('ProfileFactory', function ($resource) {
    return $resource('/api/profile/:username/:related', {},{
      authors: {
        method: 'GET',
        params: {
          related: 'authors/'
        }
      },
      update: {
        method:'PUT'
      },
      patch: {
        method:'PATCH'
      }
    });
  })
  .factory('UserFactory', function ($resource) {
    return $resource('/api/user/:fn', {}, {
      getReviewers: {
        method: 'GET',
        params:{
          fn: 'reviewers'
        }
      }
    });
  })
  .factory('PulseFactory', function ($resource) {
    return $resource('/api/pulse/:fn/', {}, {
      activities: {
        method: 'GET',
      },
      unread:{
        method: 'GET',
        params:{
          fn: 'unread'
        }
      },
      noise:{
        method: 'GET',
        params:{
          fn: 'noise'
        }
      },
      reset: {
        method: 'POST',
        params:{
          fn: 'reset'
        }
      }
    });
  })

  .factory('CollectionFactory', function ($resource) {
    return $resource('/api/collection/:id/', {}, {});
  })

  .factory('AuthorFactory', function ($resource) {
    return $resource('/api/author/:slug/:fn/', {},{
      update: {
        method:'PUT'
      },
      patch: {
        method:'PATCH'
      },
      hallOfFame: {
        method: 'GET',
        params:{
          fn: 'hallOfFame'
        }
      }
    });
  })
  /*
    get a list of ralreeady saved document accessible by the user
  */
  // http://localhost:8888/api/document/
  .factory('DocumentFactory', function ($resource) {
    return $resource('/api/document/:id/:fn', {},{
      update: {
        method:'PUT'
      },
      suggest:{
        method: 'GET',
        params:{
          fn: 'suggest'
        }
      },
      oembed:{
        method:'GET',
        params:{
          fn: 'oembed/'
        }
      },
    });
  })
  .factory('MentionFactory', function ($resource) {
    return $resource('/api/mention/:id/');
  })
  .factory('CaptionFactory', function ($resource) {
    return $resource('/api/caption/:id/', {},{
      update: {
        method:'PUT'
      },
      patch: {
        method:'PATCH'
      }
    });
  })
  /*
    Comments and other beasts
  */
  .factory('CommentFactory', function($resource) {
    return $resource('/api/comment/:id/', {},{})
  })
  .factory('ReviewFactory', function($resource) {
    return $resource('/api/review/:id/:fn', {},{
      patch: {
        method:'PATCH'
      },
      close:{
        method:'POST',
        params:{
          fn: 'close/'
        }
      },
      report:{
        method:'GET',
        params:{
          fn: 'report/'
        }
      },
      reports:{
        method:'GET',
        params:{
          fn: 'reports/'
        }
      }
    })
  })
  /*
  /*
    list tags
  */
  .factory('TagFactory', function ($resource) {
    return $resource('/api/tag/:id/:fn/', {},{
      update: {
        method:'PUT'
      },
      hallOfFame: {
        method: 'GET',
        params:{
          fn: 'hallOfFame'
        }
      }
    });
  })
  /*
    get static pages
  */
  .factory('PageFactory', function ($resource, RUNTIME) {
    return $resource('/api/page/:name/', {},{});
  })

  /*
    Given a querystring return a proper js object
  */
  .service('QueryParamsService', function($filter){
    return function(queryparams){
      var params={};
      queryparams.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
        params[key] = decodeURIComponent(value);
      });
      return params;
    };
  })
  /*
    Update seectively dictionary for django API
  */
  .service('djangoFiltersService', function($location) {
    return function(params) {
      var _params = angular.copy(params),
          qs = $location.search();

      if(qs.filters){
        try {
          _params.filters = JSON.stringify(angular.merge(_params.filters || {}, JSON.parse(qs.filters || '{}')));
          _params.exclude = JSON.stringify(angular.merge(_params.exclude || {}, JSON.parse(qs.exclude || '{}')));
        } catch(e){
          $log.warn('ItemsCtrl @EVENTS.PARAMS_CHANGED wrong filters provided!');
        }
      }
      if(qs.orderby)
        _params.orderby = qs.orderby
      return _params;
    }
  })
  .service('bibtexService', function($filter) {
    return function(json){

    };
  })
  /*
    Given value in markdown, if it found something like <!-- lang:en_EN -->
    split the content according to the language section.
  */
  .service('markdownItLanguageService', function($filter){
    return function(value, language){
      var v,
        candidate;
      if(!value){
        return ''
      }
      candidate = _(value.split(/<!--\s*(lang:[a-zA-Z_]{2,5})\s*-->/))
        .compact()
        .chunk(2)
        .fromPairs()
        .value();
      // console.log(language, candidate)
      if(candidate['lang:'+language])
        return candidate['lang:'+language];

      return value
    }
  })

  .service('markdownItChaptersService', function($filter,markdownItLanguageService) {
    return function(value, language){
      var links = [],
          linkIndex = 0,
          md = new window.markdownit();

      md.renderer.rules.link_open = function(tokens, idx){
        var url = tokens[idx].attrGet('href').trim(); // only on block element (e.g.  url starting with 'doc/' without any text attached.

        // console.log('LINK_OPEN', url, tokens[idx])
        if(url.indexOf('voc/') === 0){
          linkIndex++;
          links.push({
            _index: linkIndex, // internal id
            citation: tokens[idx + 1].content,
            slug: url.replace('voc/','').split(',')[0],
            type: 'chapter'
          });
        }
      };
      md.render(markdownItLanguageService(value, language));
      return links
    }
  })
  .service('markdownItService', function($filter) {
    return function(value, language, disableLazyPlaceholders){
      var results,
          sections, // document sections.
          md = new window.markdownit({
            // breaks:       true
            html: true,

          })
          ,
          linkIndex = 0;

      // set initial value for results
      results = {
        md: value,
        html:'',
        ToC: [],
        docs: [],
        paragraphs: 0,
        footnotes: {}
      };
      // load footnotes plugin
      md
        .use(window.markdownitFootnote)
        .use(window.markdownitContainer, 'profile')

        .use(window.markdownitContainer, 'profile-committee')
        .use(window.markdownitContainer, 'profile-others')
        .use(window.markdownitContainer, 'abstract')
        .use(window.markdownItAttrs);


      // md.renderer.rules.paragraph_open = function(tokens, idx) {
      //   // console.log('paragraph', results.paragraphs, tokens[idx-1])
      //   if(idx > 0 && tokens[idx-1] && tokens[idx-1].type != 'footnote_open'){
      //     // debugger
      //     results.paragraphs++;
      //     // return '<p><div class="paragraph-number">'+results.paragraphs+'</div>'
      //     return '<p><span class="paragraph-number">'+results.paragraphs+'</span>'
      //   } else {
      //     return '<p>'
      //   }
      // }

      // rewrite links
      md.renderer.rules.link_open = function(tokens, idx){
        var url = tokens[idx].attrGet('href').trim(),
            klass = tokens[idx].attrGet('class') || ''; // only on block element (e.g.  url starting with 'doc/' without any text attached.

        // console.log('LINK_OPEN', url, tokens[idx])
        if(url.indexOf('doc/') === 0){
          var doc = url.trim().replace('doc/','').replace(/\//g,'-').split(',')[0];
          // for(var i in documents){
            linkIndex++;
            results.docs.push({
              _index: linkIndex, // internal id
              _type: tokens[idx + 1].content.length? 'doc': 'block-doc',
              citation: tokens[idx + 1].content,
              slug: doc,
            });

          if(!disableLazyPlaceholders && !tokens[idx + 1].content.length){
            return '<span id="item-'+linkIndex+'" class="lazy-placeholder '+klass+'" type="doc" lazy-placeholder="'+ doc + '"></span><a>';
          }

          return '<a id="item-'+linkIndex+'" class="special-link'+ (tokens[idx + 1].content.length? '':' block')+'" name="'+ doc +'" ng-click="focus(\''+ linkIndex +'\',\'' +url+'\', \'doc\')"><span hold slug="'+doc +'" type="doc"  class="anchor-wrapper"></span><span class="icon icon-eye"></span>';
          // return '<a name="' + documents[0] +'" ng-click="hash(\''+url+'\')"><span class="anchor-wrapper"></span>'+text+'</a>';
        } else if(url.trim().indexOf('voc/') === 0){
          var terms = url.trim().replace('voc/','').split(',');

          for(var ind in terms){
            linkIndex++;
            results.docs.push({
              _index: linkIndex, // internal id
              _type: 'voc',
              citation: tokens[idx + 1].content,
              slug: terms[ind],
              type: 'glossary'
            });
          }
          tokens[idx].attrSet('class', 'glossary');

          return '<a id="item-'+linkIndex+'" class="special-link glossary"  ng-click="focus(\'' +linkIndex+'\')"><span hold slug="'+ terms[0] +'" type="voc" class="anchor-wrapper"></span><span class="icon icon-arrow-right-circle"></span>' +
            (!disableLazyPlaceholders && !tokens[idx + 1].content.length? '&nbsp;': '')
           ;
          // return '<a id="item-'+linkIndex+'" class="special-link glossary"  ng-click="fullsize(\'' +url+'\', \'voc\')"><span hold slug="'+ terms[0] +'" type="voc" class="anchor-wrapper"></span><span class="icon icon-arrow-right-circle"></span>';
        } else {
          return '<a href="'+url+'" target="_blank">';
        }
      };

      md.renderer.rules.table_open = function(tokens, idx){
        return '<table class="table">';
      }

      // md.renderer.rules.link_close = function(tokens, idx){
      //   // if(tokens[idx-1].attrGet('href')){ // emtpy content, previous tocken was just href
      //   //   return '</span>';
      //   // }
      //   return '</a>';
      // };


      md.renderer.rules.heading_open = function(tokens, idx){
        var text = tokens[idx+1].content,
            h = {
              text: text,
              level: tokens[idx].tag.replace(/[^\d]/g, ''),
              slug: $filter('slugify')(text)
            };

        results.ToC.push(h);

        return '<' + tokens[idx].tag + '>'+
          // '<div class="anchor-sign" ng-click="hash(\''+ h.slug +'\')"><span class="icon-link"></span></div>'+
          '<a name="' + h.slug +'" id="h-' + h.slug +'" class="anchor" href="#' + h.slug +'"><span class="header-link"></span></a>';
      };

      console.log('rules', md.renderer.rules);



      md.renderer.rules.image = function(tokens, idx){
        var src   = tokens[idx].attrGet('src'),
            title = tokens[idx].attrGet('title'),
            alt   = tokens[idx].content;

        // console.log('IMAGE', src, 'title:', title, 'alt:', alt, tokens[idx]);

        if(alt.indexOf('profile/') === 0){
          return '<div class="profile-thumb" style="background-image:url('+src+')"></div>';
        }
        return '<img src="'+ src+ '" title="'+title+'" alt="'+alt+'"/>';
      //   renderer.image = function(src, title, alt){
      //   if((alt||'').indexOf('profile/') === 0){
      //     return '<div class="profile-thumb" style="background-image:url('+src+')"></div>';
      //   }
      //   return '<img src="'+ src+ '" title="'+title+'" alt="'+alt+'"/>';
      // };
      };

      md.renderer.rules.footnote_anchor = function(tokens, idx, options, env, slf){
        var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
        // eliminate starting and ending


        return '<span class="footnote-anchor">'+caption.replace(/[\[\]]/g, '')+'</span>';
      };
      //   console.log('markdownItService footnote', md.renderer.rules, tokens[idx])
      //   return '<div >'
      // }
      // change rules
      md.renderer.rules.footnote_ref = function (tokens, idx, options, env, slf) {
        // console.log(' md.renderer.rules.footnote_ref')
        var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
        var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
        linkIndex++;
        results.docs.push({
          _index: linkIndex, // internal id
          _type: 'footnote',
          id: id,
          caption: caption
        });

        return '<span  ng-click="focus(\''+ linkIndex +'\')" id="item-' + linkIndex +'" class="footnote-ref"><span class="footnote"><a>'+caption+'</a></span></span>' //replaced! footnote="'+ id + '" class="footnote-ref" caption="'+caption+'"></span>';
      };


      // get the yaml metadata ;)
      value.replace(/[\n\s\r]*---[\n\r]((.|[\n\r])+)\.{3}[\n\s\r]*/m, function(d, m){
        // basic metadata chunks @todo
        results.meta = m;
        return ''
      })

      // if(yamlmetadata)
      //   metadata = metadata[0]


      // split sections (main content and footnotes)
      // sections = _(value.split(/\s*[-_]{3,}\s*\n/)).value();

      // // console.log('markdownItService', sections.length)
      // // get the last section (bibliographic footnotes will be there)
      // if(sections.length > 1){
      //   results.footnotes = sections.pop();
      //   // override value with the reduced content
      //   value = sections.join('');
      //   // console.log('markedService footnotes: ', value)
      // }

      // split value according to language if available (reduce pairs)
      if(language){
        var candidate = _(value.split(/<!--\s*(lang:[a-zA-Z_]{2,5})\s*-->/))
          .compact()
          .chunk(2)
          .fromPairs()
          .value();
        // console.log(language, candidate)
        if(candidate['lang:'+language]) {
          value = candidate['lang:'+language];
        } else if(candidate['lang:en_US']) {
          value = candidate['lang:en_US'];
        }
        //value = value.split();
        value = $filter('quotes')(value, language);
      }

      // modify results
      results.html = md.render(value);

      return results;
    };
  })
  /*
    Basic item extension service, based on model name dispatch it to the correct service.
  */
  .service('extendItem', function($injector) {
    return function(item, model, options) {
      if(model == 'story') {
        return $injector.get('extendStoryItem')(item, options.language);
      }
      return item;
    }
  })
  /*
    add information about a story given its tags.
    extend story with:
    ```
    story._chapters     = [];
    story._biography    = null;
    story._isBiography  = false;
    story._isCollection = false;
    ```
    Then rewrite `covers`property excluding special documents.
    Return an extended story.
  */
  .service('extendStoryItem', function(markdownItChaptersService) {
    return function(story, language) {
      // extend story with:
      story._chapters     = [];

      story._biography    = null;
      story._isBiography  = false;
      story._isCollection = false;

      // tags by category
      story._tags = {};

      for (var i=0, j=story.tags.length; i<j; i++) {
        if(story.tags[i].category=='writing' && story.tags[i].slug == 'collection'){

          var links = markdownItChaptersService(story.contents, language);
          var stories = _.keyBy(story.stories, 'slug');

          // filter chapters from links (avoid errors, double check if links are stored and related stories still exists.)

          story._chapters = _(links).map(function(d){

            if(stories[d.slug]){
              return stories[d.slug]
            } else{
              console.warn('chapter with slug: ',d.slug, 'was not found in related stories!!!')
            }
          }).compact().value();

          story._isCollection = true;
        } else if(story.tags[i].category=='writing' && story.tags[i].slug == 'biography'){
          story._isBiography = true;
        }

        if(!story._tags[story.tags[i].category])
          story._tags[story.tags[i].category] = {}

        if(story.tags[i].status) {
          story._tags[story.tags[i].category][story.tags[i].id] = story.tags[i]
        }
      }

      // apply ordering to tags
      if(!story.data._ordering) {
        story.data._ordering = {}
      }
      // https://stackoverflow.com/questions/28719795/lodash-sort-collection-based-on-external-array
      if(!story.data._ordering.authors) {
        story.data._ordering.authors = _.map(story.authors, 'id')
      } else {
        var authors = _.keyBy(story.authors, 'id');
        story.authors = story.data._ordering.authors.map(function(d){
          return authors[d];
        })
      }

      if(!story.data._ordering.tags) {
        story.data._ordering.tags = _.mapValues(story._tags, function(d) {
          return _.map(d, 'id')
        })
      } else {
        for(var category in story.data._ordering.tags) {
          // console.log('group',j, story.data._ordering.tags[j])
          story._tags[category] = _(story.data._ordering.tags[category])
            .uniq()
              .map(function(d) {
                if(story._tags[category] && story._tags[category][d]) {
                  return story._tags[category][d];
                }
                return false
              })
              .filter(function(d){
                return d !== false
              })
              .value();

          story.tags = _(story._tags).map(_.identity).flatten().compact().value()
        }
      }

      // exclude document types as "entity" from covers
      story.covers = story.covers.filter(function(doc){
        // if there is an entity, use it as a _biography document.
        if(story._isBiography && doc.type =='entity' && doc.data.type == 'person') {
          story._biography = doc
        }
        return doc.type !=  'entity'
      });

      // confirm that the biography is valid.
      story._isBiography = !!story._biography && !!story._biography.data.activities && !!story._biography.data.activities.length;

      return story
    }
  })

  .factory('metadataFactory', function($log) {
    return {
      parse: function(story){
        $log.info('[service] metadata.parse');
      },
      create: function(story){

      }
    };
  });
