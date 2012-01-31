var forumID = "cnn";			//The ID of the Disqus forum to display popular threads for
var expandedThread;				//Contains the ID of the thread that is currently expanded
var interval = '1d';			//The interval within which to check for most popular threads

function processForumDetails(data, textStatus, jqXHR){
	$("#forumTitle").text("Top threads on " + data["response"]["name"]);		//Set the text of the title div to the forum name
}

//Gets the forum details for a particular forum
function getForumDetailsFromID(id){
	$.ajax({
		url: "https://disqus.com/api/3.0/forums/details.jsonp",
		data: {
			"api_key": "Y1S1wGIzdc63qnZ5rhHfjqEABGA4ZTDncauWFFWWTUBqkmLjdxloTb7ilhGnZ7z1",
			"forum": id
		},
		dataType: "jsonp",
		success: processForumDetails
	});
}

function processPopularThreadsResponse(data, textStatus, jqXHR){
	var results = data["response"];		//Get the response object from the json
	var html = "<ul class='listPopular'>"
	$(results).each(function(){
		var title = this["title"];		//Thread title
		var link = this["link"];		//Thread link
		var likes = this["likes"];		//# of thread likes
		var posts = this["posts"];		//# of thread posts
		var threadID = this["id"];		//id of thread
		//Create list of the popular threads, showing the title and linking to the thread
		html += "<hr><li class='thread' id='" + threadID + "'><a href='" + link + "'>" + title + "</a><br>" + posts  +" posts, " + likes + " likes";
		html += "<a href='#' class='showPopularPosts'>  show popular</a><a href='#' class='showRecentPosts'>  show recent</a></li>";
	});
	html += "</ul>";
	$("#popularThreads").html(html);
	addThreadClickListeners();			//Register the click listeners for each thread in the list.
}

function getPopularThreads(){
	$(".popularThreads").text("");
	$.ajax({
		url: "https://disqus.com/api/3.0/threads/listPopular.jsonp",
		data: {
			"api_key": "Y1S1wGIzdc63qnZ5rhHfjqEABGA4ZTDncauWFFWWTUBqkmLjdxloTb7ilhGnZ7z1",
			"forum": forumID,
			"interval": interval
		},
		dataType: "jsonp",
		success: processPopularThreadsResponse
	});
}

//A function to turn milliseconds into a readable date format (e.g. "x days ago")
function readableDateTime(ms){
	var x = ms / 1000;
	var seconds = x % 60;
	x /= 60;
	var minutes = x % 60;
	x /= 60;
	var hours = x % 24;
	x /= 24;
	var days = x;
	var result;
	days = Math.abs(Math.round(days));
	hours = Math.abs(Math.round(hours));
	minutes = Math.abs(Math.round(minutes));
	seconds = Math.abs(Math.round(seconds));
	if (days > 30) return ">1 Month ago";
	if (days > 0){
		result = days;
		result += " days ago";
		return result;
	}
	if (hours > 0){
		result = hours;
		result += " hours ago";
		return result;
	}
	if (minutes > 0){
		result = minutes;
		result += " minutes ago";
		return result;
	}
	return seconds + " seconds ago";
}

//Takes an array of posts and displays them nicely.
function displayPosts(posts){
	$(".topPosts").remove();
	var topPosts = $("<div/>", {
						"class": "topPosts"
					});
	$(posts).each(function(){
		var author = this["author"];		//Get the "author" object from the response
		var authorName = author["name"];	//Author's name
		var authorProfileURL = author["profileUrl"];	//The URL of the author's disqus profile=
		var msg = this["message"];			//The body of the post
		if(msg.length > 400)				//Limit the post body to 400 characters
			msg = msg.slice(0, 400) + "...";
		var dateTime = this["createdAt"];	//The date and time that the post was created
		dateTime = dateTime.replace(/-/g, "/").replace('T', " ");		//Turn the date into a readable format
		dateTime = new Date(dateTime);
		var howOld = Math.round(new Date() - dateTime);
		var readableTime = readableDateTime(howOld);
		var likes = this["likes"];			//The number of likes on the post

		//Use the jquery element constructor to build a "post" div containing the author and the post body
		var post = $("<div/>", {
						"class": "post",
					});
		$("<a class='author' href='" + authorProfileURL + "'>" + authorName +  "</a> --- <span>" + readableTime + "</span>").appendTo(post);
		$("<p>", {
						"class": "messageBody",
						text: msg,
					}).appendTo(post);
		$(post).appendTo(topPosts);			//Append the newly-built post to the list of posts
	});
	$(topPosts).appendTo("#"+expandedThread);
}

function processPopularPostsResponse(data, textStatus, jqXHR){
	var posts = data["response"];
	displayPosts(posts);
}

//Gets the popular posts made to a thread
function getPopularPosts(threadID){
	//Get the recent posts made on a particular thread
	$.ajax({
		url: "https://disqus.com/api/3.0/posts/listPopular.jsonp",
		data: {
			"api_key": "Y1S1wGIzdc63qnZ5rhHfjqEABGA4ZTDncauWFFWWTUBqkmLjdxloTb7ilhGnZ7z1",
			"forum": forumID,
			"thread": threadID,
		},
		dataType: "jsonp",
		success: processPopularPostsResponse
	});
}


function processRecentPostsResponse(data, textStatus, jqXHR){
	var posts = data["response"];
	displayPosts(posts);
}

//Gets the recent posts made to a thread
function getRecentPosts(threadID){
	$.ajax({
		url: "https://disqus.com/api/3.0/posts/list.jsonp",
		data: {
			"api_key": "Y1S1wGIzdc63qnZ5rhHfjqEABGA4ZTDncauWFFWWTUBqkmLjdxloTb7ilhGnZ7z1",
			"forum": forumID,
			"thread": threadID,
		},
		dataType: "jsonp",
		success: processRecentPostsResponse
	});
}

//Add a click listener to each popular thread so that it expands to show popular posts beneath it
function addThreadClickListeners(){
	$(".showPopularPosts").each(function(){
		$(this).click(function(event){
			getPopularPosts($(this).parent().attr('id'));
			expandedThread = $(this).parent().attr('id');
			event.stopPropagation();
		});
	});
	$(".showRecentPosts").each(function(){
		$(this).click(function(event){
			getRecentPosts($(this).parent().attr('id'));
			expandedThread = $(this).parent().attr('id');
			event.stopPropagation();
		});
	});
}

//Changes the global forumID and updates the feed to show the threads for that forum
function changeForum(ID){
	forumID = ID;
	getPopularThreads();
	getForumDetailsFromID(forumID);
}

//Changes the interval parameter used for the Disqus API calls (1h, 1d, 30d etc.)
function changeInterval(i){
	interval = i;
	getPopularThreads();
}

//Sets keyboard and click lissteners for parts of the page
function setListeners(){
	$('#changeForum').keypress(function(e){
    	if ( e.which == 13 ){					//Rebind enter key on this form so that it doesn't reload the page
			$("#changeForumButton").click();
			return false;
		};
	});
	$("#changeForumButton").click(function(){	//Set a click listener on the "Change forum" button to update the
		changeForum($("#changeForumText").val());	//feed for the current forum
	});
	$(".intervalChoice").click(function(){		//Set click listeners on the interval selection buttons
		changeInterval($(this).attr('id'));
	});
}

$(document).ready(function(){
	setListeners();
	getPopularThreads();
	getForumDetailsFromID(forumID);
});
