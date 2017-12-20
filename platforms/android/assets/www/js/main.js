var theList = $("#mylist");
var MainURL="https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=80865681c4ccae7b47ffebc8b71952d8";


function init(){
     create_database();
     getMoviesListAndDrawList();
     $('#film_list').click(function(){
            getMoviesListAndDrawList();
         });
     $('#fav_list').click(function(){
            select_database();
         });
}

function getMoviesListAndDrawList(){
    theList.empty();
     var request = $.ajax({
          url: MainURL,
          method: "GET"
        });

        request.done(function( moviesList ) {

            for (i=0;i<moviesList.results.length;i++){

            theList.append(
            '<li><a Onclick="javascript:selected_favorite('+moviesList.results[i].id+',\'webDetail\')">'+

            '<img src="https://image.tmdb.org/t/p/w92'+moviesList.results[i].poster_path+'">'+moviesList.results[i].original_title +"<br><p>" +moviesList.results[i].overview+ "</p></a></li>");
                }

            theList.listview("refresh");
            
            });

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
}

function create_database(){

     db = window.sqlitePlugin.openDatabase({name: 'favorites.db', location: 'default'});

     db.sqlBatch([
    'CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY,original_title, vote_average,release_date,genres,overview,poster_path,backdrop_path)',
     ], function() {
    console.log('Created database OK');
  }, function(error) {
    console.log('SQL batch ERROR: ' + error.message);
  });
}

function select_database(){

     db.executeSql('SELECT * FROM favorites', [], function(rs) {
      if (rs.rows.length == 0){
          theList.empty();
            theList.append(
                    '<li>'+
                        '<h3>Start adding your favorites films!</h3>'+
                    '<li>'
                );
          theList.listview("refresh");
      }
    else{
        theList.empty();
        for(i=0;i<rs.rows.length;i++){
        theList.append(
                                                 '<li class="ui-body-a"  style="border: none">'+
                                                    '<ul data-role="listview" class="ui-grid-a">'+
                                                    '<li class="ui-block-a">'+
                                                    '<img src="http://image.tmdb.org/t/p/w154'+rs.rows.item(i).poster_path+'" style="width">'+
                                                    '</li>'+
                                                    '<li class="ui-block-b" >'+
                                                        '<ul data-role="listview" class="ui-grid-a">'+
                                                            '<li class="ui-block-a" style="width:80%;"><h3>'+rs.rows.item(i).original_title+'</h3></li><br>'+
                                                        '</ul>'+
                                                        '<ul data-role="listview" class="ui-grid-a">'+
                                                        '</ul>'+
                                                        '<div><p class="description_list" >'+rs.rows.item(i).overview+'</p></div>'+
                                                        '<a onclick="javascript:delete_favorite('+rs.rows.item(i).id+')">QUIT START</a>'+
                                                    '</li>'+
                                                '</ul>'+
                                                '</li>');
        }
        theList.listview("refresh");
    }
  }, function(error) {
    console.log('SELECT SQL statement ERROR: ' + error.message);
  });

}
function delete_favorite(id){
    db.executeSql('SELECT * FROM favorites WHERE id=?', [id], function(res) {
        var title = res.rows.item(0).original_title;
        var vote = res.rows.item(0).vote_average;
        var date = res.rows.item(0).release_date;
        var genres= res.rows.item(0).genres;
        var overview = res.rows.item(0).overview;
        var poster = res.rows.item(0).poster_path;
        var backdrop = res.rows.item(0).backdrop_path;

                db.executeSql('DELETE FROM favorites WHERE id=?', [id], function(rs) {
                console.log("delete id "+id);
                console.log('rowsDeleted: ' + rs.rowsAffected);
                $('#fav').attr("class","fa fa-star-o");
                $('#fav').css("color","red");
                console.log(title+"Delete favorites , extra ");
                $('#fav').attr("onclick",'add_favorite('+id+',"'+title+'","'+vote+'","'+date+'","'+genres+'","'+overview+'","'+poster+'","'+backdrop+'")');
                select_database();
              }, function(error) {
                console.log('Delete SQL statement ERROR: ' + error.message);
              });
      }, function(error) {
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });
}

function add_favorite(id,title,vote,date,genres,overview,poster,backdrop){

    db.executeSql('INSERT INTO favorites VALUES (?,?,?,?,?,?,?,?)', [id,title,vote,date,genres,overview,poster,backdrop], function(rs) {

        $('#fav').css("color","green");
        $('#fav').attr("onclick","delete_favorite("+id+")");
  }, function(error) {
    console.log('SELECT SQL statement ERROR: ' + error.message);
    alert("SELECT SQL statement ERROR: " + error.message)
  });
}

function selected_favorite(id,destination){
            theList.empty();
            theList.append( '<li class="kart-loader" style="border:none;margin-top: 50%;margin-left:28%;padding:20%;"><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div><div class="sheath"><div class="segment"></div></div></li>'
                );
            theList.listview("refresh");

        db.executeSql('SELECT count(*) AS mycount FROM favorites WHERE id=?', [id], function(res) {
        var counter = res.rows.item(0).mycount;
        if (destination == "webDetail"){
            if (counter == 0){
                getMovieAndDrawDetail(id,false);}
            else{
               getMovieAndDrawDetail(id,true);}
        }
        else {
            if (counter == 0){
                detailDB(id,false);}
            else{
               detailDB(id,true);}
        }

      }, function(error) {
        console.log('SELECT SQL statement ERROR: ' + error.message);
      });
}

function getMovieAndDrawDetail(id,sel_fav){


     var request = $.ajax({
          url: "https://api.themoviedb.org/3/movie/"+id+"?api_key=80865681c4ccae7b47ffebc8b71952d8",
          method: "GET",
        });

        request.done(function( result ) {
            theList.empty();
            var GenreString="";
            var starType="";
            var starColor="";
            var starLink="";
            for(ig=0;ig<result.genres.length;ig++){
                if((result.genres.length - ig) == 1){
                    GenreString += result.genres[ig].name;
                }
                else{
                GenreString += result.genres[ig].name + ",";
                }
                }

                var TitleStringWithQuoteMarks = result.original_title;
                var correctTitleString = TitleStringWithQuoteMarks.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                var OverviewStringWithQuoteMarks = result.overview;
                var correctOverviewString = OverviewStringWithQuoteMarks.replace(/'/g, "&apos;").replace(/"/g, "&quot;");


              if(sel_fav == 1){
                    starType="fa fa-star";
                    starColor="color:yellow;";
                    starLink="onclick='delete_favorite("+result.id+")'";
                }

                else if(sel_fav == 0){
                    starType="fa fa-star-o";
                    starColor="color:black;";

                  starLink='onclick=\'add_favorite("'+result.id+'","'+correctTitleString+'","'+result.vote_average+'","'+result.release_date+'","'+GenreString+'","'+correctOverviewString+'","'+result.poster_path+'","'+result.backdrop_path+'")\'';

                }
                theList.append(
                                     '<li class="ui-body-a"  style="border: none">'+
                                        '<ul data-role="listview" class="ui-grid-a">'+
                                            '<ul data-role="listview" class="ui-grid-a">'+
                                                '<li class="ui-block-solo" font-size:18px;">'+result.original_title+'</li>'+
                                            '</ul>'+
                                            '<ul data-role="listview" class="ui-grid-a">'+
                                                '<li class="ui-block-a" style="width:70%;"><h3  style="font-weight:lighter;"><i class="fa fa-calendar" aria-hidden="true"></i> Release date: '+result.release_date+'</h3></li>'+
                                                '<li class="ui-block-a" style="width:60%;"><h3> Stars: '+result.vote_average+' <i class="fa fa-star"  aria-hidden="true"></i></h3></li>'+
                                            '</ul>'+
                                            '<div><p class="description_listDetails" >'+result.overview+'</p></div>'+
                                             '<a '+starLink+' data-role="button" id="fav"> STAR </a><br><br>'+
                                             '<li>'+
                                             '<img src="http://image.tmdb.org/t/p/w185'+result.poster_path+'" style="width">'+
                                              '</li>'+
                                        '</li>'+
                                    '</ul>'+
                                    '</li>');
                theList.listview("refresh");
        });

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
}