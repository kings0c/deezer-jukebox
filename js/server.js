var socket = io();

DZ.init({
    appId  : '159261',
    channelUrl : 'http://localhost/misterSpot/mistaSpot/channel.php',
    player: {
        container: 'player',
        width : 400,
        height : 108,
        format : 'horizontal',
        onload : function() {
            console.log("Deezer loaded");
        }
    }
});

//TODO: - use track object instead of ID
//
//
socket.on("new song", function(trackid) {
    var title, artist, album;
    //Get the track information for incoming song
    $.ajax({
        method: "GET",
        jsonp: "callback",

        //expecting JSONP (cross-domain)
        dataType: "jsonp",
        data: {
            format: "json"
        },
        crossDomain: true,
        url: 'http://api.deezer.com/track/' + trackid + '&output=jsonp',
        success: function (response) {
            if (response) {
                var track = response;   //Current track from results
                
                //If we're not already playing, play the track
                if(!DZ.player.isPlaying()) { 
                    DZ.player.playTracks([trackid]);
                }
                else {
                    //ELse add the incoming song to Deezer queue
                    DZ.player.addToQueue([trackid]);
                    DZ.player.play();
                }
                
                setTimeout(updatePlayQueues, 1000);
            }
        }
    });
});

function updatePlayQueues() {
    console.log("Updating play queue");
    
    //Empty the queue
    $("#play-queue").empty();
    
    //Grab tracklist from Deezer and remove any already played tracks (index is less than current)
    var trackList = DZ.player.getTrackList(); //Actual list
    var currentTrackIndex = DZ.player.getCurrentIndex();
    var newTrackList = []; //New list which we will use to update play queue display on server and client
    
    for(var i=0; i < trackList.length; i++) {
        if(i >= currentTrackIndex) {
            
            newTrackList.push(trackList[i]);
            
            $("#play-queue").append("<li><button class='topcoat-icon-button'>" + 
                                    "<span class='fa fa-arrow-right'></span></button>" + 
                                    "<span class='title'>" + trackList[i].title + "</span>" + 
                                    "<span class='artist'>" + trackList[i].artist.name + "</span>" + 
                                    "<span class='album'>" + trackList[i].album.title + "</span>" + 
                                    "</li>");
            
        }
    }
    
    socket.emit('new tracklist', newTrackList);
}

//Listen for tracklist change and play the player if so
//Cant seem to get this to work, never called
DZ.Event.subscribe('tracklist_changed', function() {
    console.log("Tracklist changed.");
});

//Listen for change of current track and update local play queue
//And send updated play queue to clients
DZ.Event.subscribe('current_track', function(evt_name) {
    console.log("Beginning new track.");
    
    //Update the play queue
    setTimeout(updatePlayQueues, 1000);
    
});

$(document).ready(function() {
    
});