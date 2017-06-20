angular.module('miller').controller('EnrichModalCtrl', function ($timeout, $scope, $log, QueryParamsService, DocumentFactory, StoryFactory, OembedSearchFactory, CrossRefFactory, localStorageService, Upload) {
  
  $log.info('EnrichModalCtrl ready with crazy scope, language:', $scope.language);

  // initialize tabs here
  $scope.tabs = {
    favourite: {
      name: 'favourite',
      items: [],
      count: 0,
      next: undefined,
      isLoadingNextItems: false,
      
      suggestions: [],

      suggest: function(query, keep){
        var $s = this,
            q  = query.length > 2? query.replace('*', '').trim() + '*': false;

        $log.log('tab.favourite > suggest', $s);
        $s.isLoadingNextItems = true;
        if(!keep){
          $s.next = undefined;
        }

        DocumentFactory.get($s.next || q? {
          q: q,
          facets: 'data__type'
          // filters: JSON.stringify(query.length > 2? {contents__icontains: query}: {})
        }: {
          facets: 'data__type'
        }, function(res){
          $log.log('tab.favourite > suggest loaded n.docs:', res.results.length, QueryParamsService(res.next || ''));
          
          $s.items   = $s.next? ($s.items || []).concat(res.results): res.results;
          $s.count   = res.count;
          $s.missing = res.count - $s.items.length;
          $s.next    = QueryParamsService(res.next || '');

          $s.isLoadingNextItems = false;

          $s.typeahead(query);
        });
      },

      suggestquery: function(q) {
        var $s = this;
        $scope.query = q;
        $s.suggest(q);
      } ,

      typeahead: function(query) {
        var $s = this;
        if (query.length < 3){
          $s.suggestions = [];
          return
        }

        DocumentFactory.suggest({
          q: query
        }, function(res) {
          $s.suggestions = res.results;
        });
      },
      init: function(){
        $log.log('init', this);
        localStorageService.set('lasttabname', this.name)
        this.suggest($scope.query || '');
      }
    },
    crossref:{
      name: 'crossref',
      items: [],
      count: 0,
      next: undefined,
      suggest: function(query, keep){
        var $s = this;
        $log.log('tab.crossref > suggest - query:', query, '- keep:', keep || false, ($s.next? '- next.page: '+ $s.next.page:''));
        if(!query && $s.next && $s.next.query)
          query = $s.next.query || '';

        if(!query || query.length < 3 || $s.isLoadingNextItems){
          return;
        }

        $s.isLoadingNextItems = true;
        if(!keep){
          $s.next = {
            page: 1,
            rows: 4
          }
        }


        CrossRefFactory.search(query, $s.next.page, $s.next.rows).success(function(res){
          $s.items = $s.next.page > 1? ($s.items || []).concat(res.items): res.items;
          $s.count = res.totalResults;
          $s.missing = res.totalResults - $s.items.length;
          $s.isLoadingNextItems = false;
          $s.next.page = Math.min(Math.ceil(res.totalResults/res.itemsPerPage), Math.floor((res.startIndex + res.itemsPerPage)/res.itemsPerPage) + 1), 
          $s.next.rows = res.itemsPerPage;
          $s.next.query = query;
          console.log("next", $s.next);
        }).error(function(){
          $s.items = []
          $s.isLoadingNextItems = false;
          $s.items = [
            {
              "id": "http://dx.doi.org/10.1007/bf02279529",
              "doi": "http://dx.doi.org/10.1007/bf02279529",
              "score": 16.447716,
              "normalizedScore": 74,
              "title": "Understanding (hyper) media: Required readings",
              "fullCitation": "Allen Renear, 1995, 'Understanding (hyper) media: Required readings', <i>Computers and the Humanities</i>, vol. 29, no. 5, pp. 389-407",
              "coins": "ctx_ver=Z39.88-2004&amp;rft_id=info%3Adoi%2Fhttp%3A%2F%2Fdx.doi.org%2F10.1007%2Fbf02279529&amp;rfr_id=info%3Asid%2Fcrossref.org%3Asearch&amp;rft.atitle=Understanding+%28hyper%29+media%3A+Required+readings&amp;rft.jtitle=Computers+and+the+Humanities&amp;rft.date=1995&amp;rft.volume=29&amp;rft.issue=5&amp;rft.spage=389&amp;rft.epage=407&amp;rft.aufirst=Allen&amp;rft.aulast=Renear&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Ajournal&amp;rft.genre=article&amp;rft.au=Allen+Renear",
              "year": "1995"
            },
            {
              "id": "http://dx.doi.org/10.4242/balisagevol5.renear01",
              "doi": "http://dx.doi.org/10.4242/balisagevol3.renear01",
              "score": 16.447716,
              "normalizedScore": 74,
              "title": "Documents Cannot Be Edited",
              "fullCitation": "Allen H. Renear, Karen M. Wickett, 'Documents Cannot Be Edited', <i>Proceedings of Balisage: The Markup Conference 2009</i>",
              "coins": "ctx_ver=Z39.88-2004&amp;rft_id=info%3Adoi%2Fhttp%3A%2F%2Fdx.doi.org%2F10.4242%2Fbalisagevol3.renear01&amp;rfr_id=info%3Asid%2Fcrossref.org%3Asearch&amp;rft.atitle=Documents+Cannot+Be+Edited&amp;rft.jtitle=Proceedings+of+Balisage%3A+The+Markup+Conference+2009&amp;rft.aufirst=Allen+H.&amp;rft.aulast=Renear&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Ajournal&amp;rft.genre=proceeding&amp;rft.au=Allen+H.+Renear&amp;rft.au=+Karen+M.+Wickett",
              "year": null
            },
            {
              "id": "http://dx.doi.org/10.4242/balisagevol5.renear02",
              "doi": "http://dx.doi.org/10.4242/balisagevol5.renear02",
              "score": 16.447716,
              "normalizedScore": 74,
              "title": "There are No Documents",
              "fullCitation": "Allen H. Renear, Karen M. Wickett, 'There are No Documents', <i>Proceedings of Balisage: The Markup Conference 2010</i>",
              "coins": "ctx_ver=Z39.88-2004&amp;rft_id=info%3Adoi%2Fhttp%3A%2F%2Fdx.doi.org%2F10.4242%2Fbalisagevol5.renear01&amp;rfr_id=info%3Asid%2Fcrossref.org%3Asearch&amp;rft.atitle=There+are+No+Documents&amp;rft.jtitle=Proceedings+of+Balisage%3A+The+Markup+Conference+2010&amp;rft.aufirst=Allen+H.&amp;rft.aulast=Renear&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Ajournal&amp;rft.genre=proceeding&amp;rft.au=Allen+H.+Renear&amp;rft.au=+Karen+M.+Wickett",
              "year": null
            },
            {
              "id": "http://dx.doi.org/10.1142/9789812701527_0069",
              "doi": "http://dx.doi.org/10.1142/9789812701527_0069",
              "score": 16.447716,
              "normalizedScore": 74,
              "title": "SOME CONCEPTUAL MODELING ISSUES IN FRBR",
              "fullCitation": "ALLEN RENEAR, YUNSEON CHOI, 2005, 'SOME CONCEPTUAL MODELING ISSUES IN FRBR', <i>Knowledge Management</i>",
              "coins": "ctx_ver=Z39.88-2004&amp;rft_id=info%3Adoi%2Fhttp%3A%2F%2Fdx.doi.org%2F10.1142%2F9789812701527_0069&amp;rfr_id=info%3Asid%2Fcrossref.org%3Asearch&amp;rft.atitle=SOME+CONCEPTUAL+MODELING+ISSUES+IN+FRBR&amp;rft.jtitle=Knowledge+Management&amp;rft.date=2005&amp;rft.aufirst=ALLEN&amp;rft.aulast=RENEAR&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Ajournal&amp;rft.genre=proceeding&amp;rft.au=ALLEN+RENEAR&amp;rft.au=+YUNSEON+CHOI",
              "year": "2005"
            }
          ];
          $s.count= 6
          $s.missing = 2;

        })
      },
      init: function(){
        $log.log('init', this);
        localStorageService.set('lasttabname', this.name)
        this.suggest($scope.query || '');
      }
    },
    glossary: {
      name: 'glossary',
      items: [],
      count: 0,
      next: undefined,
      suggest: function(query, keep){
        var $s = this;
        $log.log('tab.glossary > suggest', $s);
        
        $s.isLoadingNextItems = true;
        if(!keep){
          $s.next = undefined;
        }

        StoryFactory.get($s.next || {
          filters: JSON.stringify(query.length > 2? {
            contents__icontains: query,
            tags__category__in: ['writing', 'blog'],
            status: 'public'
          } : {
            tags__category__in: ['writing', 'blog'],
            status: 'public'
          })
        },function(res){
          $log.log('tab.glossary > suggest loaded n.docs:', res.results.length, QueryParamsService(res.next || ''));
          
          $s.items   = $s.next? ($s.items || []).concat(res.results): res.results;
          $s.count   = res.count;
          $s.missing = res.count - $s.items.length;
          $s.next    = QueryParamsService(res.next || '');
          $s.isLoadingNextItems = false;
        });
      },
      init: function(){
        $log.log('init', this);
        localStorageService.set('lasttabname', this.name)
        this.suggest($scope.query || '');
      }
    },
    url: {
      name: 'url',
      items: [],
      suggest: function(url, keep){
      
      },
      onEmbedChange: function(){
        // change type if there is an embed with type link! We put rich.
        $log.log('EMC @embed embed.type:', $scope.embed.type);
        if($scope.embed.html && $scope.embed.type == 'link')
          $scope.embed.type = 'rich'
      },
      
      init: function(){
        $log.log('init', this);
        localStorageService.set('lasttabname', this.name)
        this.suggest($scope.url || '');
      }
    },
    CVCE: {
      name: 'CVCE',
      items: [],
      count: 0,
      next: undefined,
      suggest: function(query, keep){
        var $s = this;
        $log.log('tab.CVCE > suggest - query:', query);
        $s.isLoadingNextItems = true;
        
        if(!OembedSearchFactory.CVCE){
          $log.error('OembedSearchFactory.CVCE does not exist');
          return;
        }

        if(!query || query.length < 3){
          return;
        }

        

        if(!keep){
          $s.next = undefined;
        }

        
        OembedSearchFactory.CVCE($s.next || {
          q: query
        }).then(function(res){
          $log.log('tab.CVCE > suggest loaded n.docs:', res.data.count);
          $s.items   = $s.next? ($s.items || []).concat(res.data.results): res.data.results;
          $s.count   = res.data.count;
          $s.missing = res.data.count - $s.items.length;
          $s.next    = QueryParamsService(res.data.next || '');
          $s.query   = query;

          $s.isLoadingNextItems = false;
          // scope.suggestMessage = '(<b>' + res.data.count + '</b> results)';
        }, function(){
          debugger
        });
      },
      init: function(){
        $log.log('init', this);
        localStorageService.set('lasttabname', this.name)
        this.suggest($scope.query || '');
      }
    },
    upload: {
      name: 'upload', 
      items: [],
      undo: function(){
        $scope.uploadable = null;
        $scope.uploadablefile = {};
      },
      // stands for upload, suggest is a placeholder here.
      upload: function(){
        var $s = this;
        if(!$scope.uploadablefile){
          // error
          $log.warn('no file is selected');
          return
        }
        
        var types = {
          'image/jpg': 'image',
          'image/png': 'image',   
          'application/pdf': 'pdf'
        };
        debugger
        // uploadable has value, name and size.
        Upload.upload({
          url: '/api/document/',
          data: {
            title: $scope.uploadablefile.title || $scope.uploadablefile.name,
            type: types[$scope.uploadablefile.type] || $scope.uploadablefile.type.split('/').shift(),
            mimetype: $scope.uploadablefile.type,
            metadata: JSON.stringify({
              bibtex: $scope.reference,
              copyright: $scope.uploadablefile.copyright
            }),
            attachment: $scope.uploadablefile.f
          }
        }).then(function (res) {
          $log.debug('UploadCtrl -> upload() status:', res.status)
          if(res.status == 201){
            $log.debug('UploadCtrl -> upload() status:', 'success!', res.data)
            // add document
            $scope.uploadablefile.progressPercentage = 0;
            $scope.uploadablefile.document = res.data;
            $scope.selectDocument($scope.uploadablefile.document);
          } else {
            $log.error(res);
            // error handling?
          }

        }, null, function (evt) {
          $scope.uploadablefile.progressPercentage = parseInt(10000.0 *
            evt.loaded / evt.total)/100;
          $log.log('progress: ' + $scope.uploadablefile.progressPercentage + 
              '% ' + evt.config.data, $scope.uploadablefile.name, evt);
        });

      },
      init: function(){
        $log.log('init', this);
        // forget previous upload
        $scope.uploadable = null;
        $scope.uploadablefile = {};
        localStorageService.set('lasttabname', this.name)
      }
    }
  };
  
  $scope.uploadablefile = {}

  $scope.$watch('uploadable', function (v) {
    if(v){
      $log.debug('::mde @uploadable', v)
      $scope.uploadablefile.f = v;
      $scope.uploadablefile.name = v.name;
      $scope.uploadablefile.size = v.size;
      $scope.uploadablefile.type = v.type;
    }
  });

  var timer_preview;
  $scope.previewUrl = function(url){
    if(timer_preview)
      $timeout.cancel(timer_preview);
    // check url
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&&#37;@!\-\/]))?/;
    if(!regexp.test(url)){
      $log.error('::mde -> previewUrl() url provided:', url, 'is not valid');
      $scope.suggestMessage = '(url is not valid)';
      $scope.isUrlValid = false;
      $scope.embed = null;

      return false;
    }
    $scope.isUrlValid = true;
    url = url.replace('#', '.hash.');
    timer_preview = $timeout(function(){
      $log.debug('::mde -> previewUrl() url:', url);
      $scope.suggestMessage = '(loading...)';

      DocumentFactory.oembed({url: url}, function(data){
        $log.debug(':: mde -> previewUrl() received:', data)
        $scope.embed = data;
        $scope.suggestMessage = '(<b>done</b>)';
      }, function(err){
        debugger
        $scope.suggestMessage = '(<b>error</b>)';
      })

      // embedService.get(url).then(function(data){
      //   $log.debug(':: mde -> previewUrl() received:', data)
      //   $scope.embed = data;
      //   $scope.suggestMessage = '(<b>done</b>)';
      // });
    }, 20);
  };

  

  $scope.setTab = function(tabname){
    $log.log('EnrichModalCtrl -> setTab() tab.name:', tabname);

    $scope.tab = $scope.tabs[tabname];
    $scope.tab.init()
  }


  $scope.suggest = function(query){
    $log.log('EnrichModalCtrl -> suggest() q:', query);
    $scope.tab.suggest(query);
  }

  $scope.upload = function(query){
    $log.log('EnrichModalCtrl -> upload()');
    $scope.tab.upload();
  }

  $scope.undo = function(){
    $log.log('EnrichModalCtrl -> undo()');
    $scope.tab.undo();
  }


  $scope.more = function(query, tab){
    $log.log('EnrichModalCtrl -> more()');
    $scope.tab.suggest(query, true);
  }


  
  $scope.setTab(localStorageService.get('lasttabname') || 'favourite');


});