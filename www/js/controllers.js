angular.module('your_app_name.controllers', [])

.controller('AuthCtrl', function($scope, $ionicConfig, $ionicLoading, $q, UserService, $state, FACEBOOK_APP_ID) {

	//This is the success callback from the login method
	var fbLoginSuccess = function(response) {
		if (!response.authResponse){
		  fbLoginError("Cannot find the authResponse");
		  return;
		}
		console.log('fbLoginSuccess');

		var authResponse = response.authResponse;

		getFacebookProfileInfo(authResponse)
			.then(function(profileInfo) {

			  console.log('profile info success', profileInfo);
			  //for the purpose of this example I will store user data on local storage
			  UserService.setUser({
			    authResponse : authResponse,
			    profileInfo : profileInfo,
			    picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
			  });

			  $ionicLoading.hide();
			  $state.go('app.feeds-categories');
			}, function(fail){
			  //fail get profile info
			  console.log('profile info fail', fail);
		});
	};

	//This is the fail callback from the login method
	var fbLoginError = function(error){
		console.log('fbLoginError');
		$ionicLoading.hide();
	};

	//this method is to get the user profile info from the facebook api
	var getFacebookProfileInfo = function (authResponse) {
		var info = $q.defer();

		facebookConnectPlugin.api('/me?fields=about,bio,birthday,email,name&access_token=' + authResponse.accessToken, null,
		  function (response) {
		    info.resolve(response);
		  },
		  function (response) {
		    info.reject(response);
		  }
		);
		return info.promise;
	};

	$scope.login = function() {
	    if (!window.cordova) {
	      //this is for browser only
	      facebookConnectPlugin.browserInit(FACEBOOK_APP_ID);
	    }

	    facebookConnectPlugin.getLoginStatus(function(success){
	     if(success.status === 'connected'){
	        // the user is logged in and has authenticated your app, and response.authResponse supplies
	        // the user's ID, a valid access token, a signed request, and the time the access token
	        // and signed request each expire
	        console.log('getLoginStatus',success.status);
	        $state.go('app.feeds-categories');
	     } else {
	        //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
	        //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
	        console.log('getLoginStatus',success.status);
	        $ionicLoading.show({
	          template: 'Logging in...'
	        });

	        //ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
	        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
	      }
	    });
	};
})

// APP
.controller('AppCtrl', function($scope, $ionicConfig, UserService) {
	$scope.user = UserService.getUser();
	$scope.firstName = function() {
		var name = $scope.user.profileInfo.name;
		var end = name.indexOf(' ');
		if (end < 0) {
			end = name.length;
		}
		return name.substring(0, end);
	};
})

.controller('ProfileCtrl', function($scope, $ionicConfig, UserService) {
	$scope.user = UserService.getUser();
})

//LOGIN
.controller('LoginCtrl', function($scope, $state, $templateCache, $q, $rootScope) {
	$scope.doLogIn = function(){
		$state.go('app.feeds-categories');
	};

	$scope.user = {};

	$scope.user.email = "john@doe.com";
	$scope.user.pin = "12345";

	// We need this for the form validation
	$scope.selected_tab = "";

	$scope.$on('my-tabs-changed', function (event, data) {
		$scope.selected_tab = data.title;
	});

})

.controller('SignupCtrl', function($scope, $state) {
	$scope.user = {};

	$scope.user.email = "john@doe.com";

	$scope.doSignUp = function(){
		$state.go('app.feeds-categories');
	};
})

.controller('ForgotPasswordCtrl', function($scope, $state) {
	$scope.recoverPassword = function(){
		$state.go('app.feeds-categories');
	};

	$scope.user = {};
})

.controller('RateApp', function($scope) {
	$scope.rateApp = function(){
		if(ionic.Platform.isIOS()){
			//you need to set your own ios app id
			AppRate.preferences.storeAppURL.ios = '1234555553>';
			AppRate.promptForRating(true);
		}else if(ionic.Platform.isAndroid()){
			//you need to set your own android app id
			AppRate.preferences.storeAppURL.android = 'market://details?id=ionFB';
			AppRate.promptForRating(true);
		}
	};
})

.controller('SendMailCtrl', function($scope) {
	$scope.sendMail = function(){
		cordova.plugins.email.isAvailable(
			function (isAvailable) {
				// alert('Service is not available') unless isAvailable;
				cordova.plugins.email.open({
					to:      'envato@startapplabs.com',
					cc:      'hello@startapplabs.com',
					// bcc:     ['john@doe.com', 'jane@doe.com'],
					subject: 'Greetings',
					body:    'How are you? Nice greetings from IonFullApp'
				});
			}
		);
	};
})

.controller('MapsCtrl', function($scope, $ionicLoading, $http, VenueService) {

	$scope.venues = [];
	$scope.hasData = false;

	$scope.options = {
		center: new google.maps.LatLng(0, 0),
		zoom: 15,
	};

	$scope.triggerOpenInfoWindow = function(venue) {
		console.log(venue.getName());
	    $scope.markerEvents = [
	      {
	        event: 'openinfowindow',
	        ids: [venue.getId()]
	      },
	    ];
	};

	VenueService.getAll()
		.then(
			function(result) {
				$scope.hasData = true;
				for (var key in result) {
					$scope.venues.push(result[key]);
				}
				$scope.venues.sort(
					function(obj1, obj2){ 
						return obj1.getDistance() - obj2.getDistance();
					}
				);
				var lat = $scope.venues[0].getLatitude();
				var lng = $scope.venues[0].getLongitude();
				$scope.options.center = new google.maps.LatLng(lat, lng);
			},
			function(reason) {
				console.log("Could not fetch venues: " + reason);
			}
		);

/*	$http.get('feeds-categories.json').success(function(result) {
			for (var i = 0; i < result.length; i++) {
					$scope.venues.push(result[i]);
				}
				var lat = $scope.venues[0].intLatitude;
				var lng = $scope.venues[0].intLongitude;
				$scope.center = new google.maps.LatLng(lat, lng);
	});*/

})

.controller('AdsCtrl', function($scope, $ionicActionSheet, AdMob, iAd) {

	$scope.manageAdMob = function() {

		// Show the action sheet
		var hideSheet = $ionicActionSheet.show({
			//Here you can add some more buttons
			buttons: [
				{ text: 'Show Banner' },
				{ text: 'Show Interstitial' }
			],
			destructiveText: 'Remove Ads',
			titleText: 'Choose the ad to show',
			cancelText: 'Cancel',
			cancel: function() {
				// add cancel code..
			},
			destructiveButtonClicked: function() {
				console.log("removing ads");
				AdMob.removeAds();
				return true;
			},
			buttonClicked: function(index, button) {
				if(button.text == 'Show Banner')
				{
					console.log("show banner");
					AdMob.showBanner();
				}

				if(button.text == 'Show Interstitial')
				{
					console.log("show interstitial");
					AdMob.showInterstitial();
				}

				return true;
			}
		});
	};

	$scope.manageiAd = function() {

		// Show the action sheet
		var hideSheet = $ionicActionSheet.show({
			//Here you can add some more buttons
			buttons: [
			{ text: 'Show iAd Banner' },
			{ text: 'Show iAd Interstitial' }
			],
			destructiveText: 'Remove Ads',
			titleText: 'Choose the ad to show - Interstitial only works in iPad',
			cancelText: 'Cancel',
			cancel: function() {
				// add cancel code..
			},
			destructiveButtonClicked: function() {
				console.log("removing ads");
				iAd.removeAds();
				return true;
			},
			buttonClicked: function(index, button) {
				if(button.text == 'Show iAd Banner')
				{
					console.log("show iAd banner");
					iAd.showBanner();
				}
				if(button.text == 'Show iAd Interstitial')
				{
					console.log("show iAd interstitial");
					iAd.showInterstitial();
				}
				return true;
			}
		});
	};
})

// FEED
//brings all feed categories
.controller('FeedsCategoriesCtrl', function($scope, $http, $sce, VenueService) {
	$scope.venues = [];
	$scope.hasData = false;

	$scope.todays_specials = function(venue) {
		var d = new Date();
		var today = d.getDay() || 7;	// convert sunday to 7, becuz thats how the API returns it
		var specialsStr = venue.getSpecialOffer(today);
		if (!specialsStr) {
			specialsStr = "<span style='font-style:italic'>No specials today</span>";
		}
		return $sce.trustAsHtml(specialsStr);
	};

	VenueService.getAll().then(
		function(response) {
			$scope.hasData = true;
			for (var key in response) {
				$scope.venues.push(response[key]);
			}
			$scope.venues.sort(
				function(obj1, obj2){ 
					return obj1.getDistance() - obj2.getDistance();
				}
			);
		},
		function(reason) {
			console.log("Error: Could not fetch venues, reason: " + reason);
		});
})

//bring specific category providers
.controller('CategoryFeedsCtrl', function($scope, $http, $stateParams, $sce, $ionicSlideBoxDelegate, VenueService) {
	$scope.events =  {};

	var categoryId = $stateParams.categoryId;
	var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

	var d = new Date();
	var today = d.getDay() || 7;	// convert sunday to 7, becuz thats how the API returns it
	$scope.today = today - 1;

	$scope.nextSlide = function() {
    	$ionicSlideBoxDelegate.next();
  	};

  	$scope.prevSlide = function() {
    	$ionicSlideBoxDelegate.previous();
  	};

	$scope.day_name = function(index) {
		return days[index-1];
	};

	$scope.specials_for_day = function(day) {
		if ($scope.venue) {
			var specialsStr = $scope.venue.getSpecialOffer(day);
			if (specialsStr.length <= 0) {
				specialsStr = "<span style='font-style:italic; text-align:center;'>No specials available</span>";
			}
			return $sce.trustAsHtml(specialsStr);
		}
	};

	VenueService.getOne(categoryId).then(
		function(result) {
			$scope.venue = result;
			$scope.events = result.getEvents();
		}, 
		function(reason) {
			console.log("Error: Could not fetch details, reason: " + reason);
		}
	);
})

//this method brings posts for a source provider
.controller('FeedEntriesCtrl', function($scope, $stateParams, $http, FeedList, $q, $ionicLoading, BookMarkService) {
	$scope.feed = [];

	var categoryId = $stateParams.categoryId,
			sourceId = $stateParams.sourceId;

	$scope.doRefresh = function() {

		$http.get('feeds-categories.json').success(function(response) {

			$ionicLoading.show({
				template: 'Loading entries...'
			});

			var category = _.find(response, {id: categoryId }),
					source = _.find(category.feed_sources, {id: sourceId });

			$scope.sourceTitle = source.title;

			FeedList.get(source.url)
			.then(function (result) {
				$scope.feed = result.feed;
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			}, function (reason) {
				$ionicLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			});
		});
	};

	$scope.doRefresh();

	$scope.bookmarkPost = function(post){
		$ionicLoading.show({ template: 'Post Saved!', noBackdrop: true, duration: 1000 });
		BookMarkService.bookmarkFeedPost(post);
	};
})

// SETTINGS
.controller('SettingsCtrl', function($scope, $ionicActionSheet, $state, UserService, $ionicLoading, $ionicPopup, FACEBOOK_APP_ID) {
	$scope.user = UserService.getUser();
   // LOG OUT
   // A confirm dialog to be displayed when the user wants to log out
   $scope.showConfirmLogOut = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Log out',
       template: 'Are you sure you want to log out?'
     });
     confirmPopup.then(function(res) {
       if(res) {
         //logout
         $ionicLoading.show({
           template: 'Logging out...'
         });

         if (!window.cordova) {
           //this is for browser only
           facebookConnectPlugin.browserInit(FACEBOOK_APP_ID);
         }

         facebookConnectPlugin.logout(function(){
           //success
           $ionicLoading.hide();
           $state.go('auth.walkthrough');
         },
         function(fail){
           $ionicLoading.hide();
         });
       } else {
        //cancel log out
       }
     });
   };
})

// TINDER CARDS
.controller('TinderCardsCtrl', function($scope, $http) {

	$scope.cards = [];


	$scope.addCard = function(img, name) {
		var newCard = {image: img, name: name};
		newCard.id = Math.random();
		$scope.cards.unshift(angular.extend({}, newCard));
	};

	$scope.addCards = function(count) {
		$http.get('http://api.randomuser.me/?results=' + count).then(function(value) {
			angular.forEach(value.data.results, function (v) {
				$scope.addCard(v.user.picture.large, v.user.name.first + " " + v.user.name.last);
			});
		});
	};

	$scope.addFirstCards = function() {
		$scope.addCard("https://dl.dropboxusercontent.com/u/30675090/envato/tinder-cards/left.png","Nope");
		$scope.addCard("https://dl.dropboxusercontent.com/u/30675090/envato/tinder-cards/right.png", "Yes");
	};

	$scope.addFirstCards();
	$scope.addCards(5);

	$scope.cardDestroyed = function(index) {
		$scope.cards.splice(index, 1);
		$scope.addCards(1);
	};

	$scope.transitionOut = function(card) {
		console.log('card transition out');
	};

	$scope.transitionRight = function(card) {
		console.log('card removed to the right');
		console.log(card);
	};

	$scope.transitionLeft = function(card) {
		console.log('card removed to the left');
		console.log(card);
	};
})


// BOOKMARKS
.controller('BookMarksCtrl', function($scope, $rootScope, BookMarkService, $state) {

	$scope.bookmarks = BookMarkService.getBookmarks();

	// When a new post is bookmarked, we should update bookmarks list
	$rootScope.$on("new-bookmark", function(event){
		$scope.bookmarks = BookMarkService.getBookmarks();
	});

	$scope.goToFeedPost = function(link){
		window.open(link, '_blank', 'location=yes');
	};
	$scope.goToWordpressPost = function(postId){
		$state.go('app.post', {postId: postId});
	};
})

// WORDPRESS
.controller('WordpressCtrl', function($scope, $http, $ionicLoading, PostService, BookMarkService) {
	$scope.posts = [];
	$scope.page = 1;
	$scope.totalPages = 1;

	$scope.doRefresh = function() {
		$ionicLoading.show({
			template: 'Loading posts...'
		});

		//Always bring me the latest posts => page=1
		PostService.getRecentPosts(1)
		.then(function(data){
			$scope.totalPages = data.pages;
			$scope.posts = PostService.shortenPosts(data.posts);

			$ionicLoading.hide();
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	$scope.loadMoreData = function(){
		$scope.page += 1;

		PostService.getRecentPosts($scope.page)
		.then(function(data){
			//We will update this value in every request because new posts can be created
			$scope.totalPages = data.pages;
			var new_posts = PostService.shortenPosts(data.posts);
			$scope.posts = $scope.posts.concat(new_posts);

			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};

	$scope.moreDataCanBeLoaded = function(){
		return $scope.totalPages > $scope.page;
	};

	$scope.bookmarkPost = function(post){
		$ionicLoading.show({ template: 'Post Saved!', noBackdrop: true, duration: 1000 });
		BookMarkService.bookmarkWordpressPost(post);
	};

	$scope.doRefresh();
})

// WORDPRESS POST
.controller('WordpressPostCtrl', function($scope, post_data, $ionicLoading) {

	$scope.post = post_data.post;
	$ionicLoading.hide();

	$scope.sharePost = function(link){
		window.plugins.socialsharing.share('Check this post here: ', null, null, link);
	};
})


.controller('ImagePickerCtrl', function($scope, $rootScope, $cordovaCamera) {

	$scope.images = [];

	$scope.selImages = function() {

		window.imagePicker.getPictures(
			function(results) {
				for (var i = 0; i < results.length; i++) {
					console.log('Image URI: ' + results[i]);
					$scope.images.push(results[i]);
				}
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}, function (error) {
				console.log('Error: ' + error);
			}
		);
	};

	$scope.removeImage = function(image) {
		$scope.images = _.without($scope.images, image);
	};

	$scope.shareImage = function(image) {
		window.plugins.socialsharing.share(null, null, image);
	};

	$scope.shareAll = function() {
		window.plugins.socialsharing.share(null, null, $scope.images);
	};
})

;
