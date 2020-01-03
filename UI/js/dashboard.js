$('.carousel').carousel('cycle',{
    interval: 1000
});
//var url1 = "https://nutriaid-python.herokuapp.com/";
var url1 = "http://localhost:5000";
var nutrition_data=[];
var recommendations=[];

var favorites =  [];
var favoritesAdded = (localStorage.getItem('favoritesAdded')) ? JSON.parse(localStorage.getItem('favoritesAdded')) : [];
var favoritesRemoved = (localStorage.getItem('favoritesRemoved')) ? JSON.parse(localStorage.getItem('favoritesRemoved')) : [];

var pythonURL = "http://localhost:5000";
var nodeURL = "http://localhost:3001/";//"https://nutri-aid-backend.herokuapp.com/";
$(document).ready(function(){
    if (sessionStorage.getItem('user')) {
        // alert(sessionStorage.getItem('user'));
        $("#nav-dashboard-tab").show();
        $("#nav-signout-tab").show();
        $("#nav-signin-tab").hide();
        $("#nav-signup-tab").hide();
        $("#nav-initialsurvey-tab").show();



    } else {
        $("#nav-dashboard-tab").hide();
        $("#nav-signout-tab").hide();
        $("#nav-signin-tab").show();
        $("#nav-initialsurvey-tab").hide();
    }
    //$("#forgotpasswordModal").hide();

    $("#nav-signout-tab").click(function(){
   
         var data ={
            add : JSON.parse(localStorage.getItem('favoritesAdded')),
            remove : JSON.parse(localStorage.getItem('favoritesRemoved')),
            user : sessionStorage.getItem('user')
        }
        console.log(data);
       // sessionStorage.clear();
       // window.location = "index.html";
        
        $.ajax({
            url: nodeURL + "updatedb",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                console.log(res);
                localStorage.clear();
                sessionStorage.clear();
                window.location = "index.html";
            }
        }) 
        
    });
    if (sessionStorage.hasOwnProperty('user')) {
        retrieveFavorites();
        var data1 = {'email': sessionStorage.getItem('user')};
        $.ajax({
            url: nodeURL + "getpreferences",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data1),
            success: function (res) {
                const response = JSON.parse(res);


            }
        }).done(function(res){
            $("#signinModal").modal('hide');
           // console.log('response length='+res);
            res = JSON.parse(res);

            if(res.length == 0) {

                $("#initialsurveyModal").modal('show');
            } else {
                //var nutrition_data = [];

                $(res).each(function(i, v){
                    //TODO: Need to find the logic to verify the order of values. As of now, it's in order.
                   // console.log(v.nutrition_name);
                    nutrition_data.push(parseInt(v.nutrition_value));

                });
                //console.log(nutrition_data);

                $.ajax({
                    url: pythonURL,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({nutrition: nutrition_data}),
                    success: function(res) {
                       // console.log(res);
                    }

                }).done(function(res){
                   // console.log("done" + res);
                   // console.log("recommendations");
                    recommendations = JSON.parse(res);
                    $('#dashboard_recommend').empty();
                    displayRecommendations(JSON.parse(res));
                   // google.charts.load("current", {packages:["corechart", "bar"]});
                  //  google.charts.setOnLoadCallback(drawChart);
                    loadStatistics();

                });
            }


        });

    } else {
        var method = 'get';
        $.ajax({
            url: pythonURL,
            type: 'get',
            dataType: 'json',
            success: function (data) {
                recommendations = data;

                displayRecommendations(data);
                loadStatistics();
            }
        });
    }
});

function loadStatistics() {
    google.charts.load("current", {packages:["corechart", "bar"]});
    google.charts.setOnLoadCallback(drawChart);
}
function drawChart() {

// Chart 1: Google Pie Chart
    if (nutrition_data.length > 0)
        var data = google.visualization.arrayToDataTable([
            ['Nutrients', 'Energy (in calories)'],
            ['Water', nutrition_data[0]], ['Protien', nutrition_data[1]], ['Fat', nutrition_data[2]],
            ['Carbohydrate', nutrition_data[3]],  ['Starch', nutrition_data[5]],
            ['Total Sugars', nutrition_data[6]],['Glucose', nutrition_data[7]],['Cholesterol', nutrition_data[8]],
             ['Calcium', nutrition_data[9]], ['Iron', nutrition_data[10]]
        ]);
    else {
        var data = google.visualization.arrayToDataTable([
            ['Nutrients', 'Energy (in calories)'],
            ['Water', 50], ['Protien', 2], ['Fat', 0.1],
            ['Carbohydrate', 1.0],  ['Starch', 0.0],
            ['Total Sugars', 0.2],['Glucose', 0.0],['Cholesterol', 1.0],
            ['Calcium', 50.0], ['Iron', 1.5]
        ]);
    }

    var options = {
        title: 'Nutritions % in the Diet picked by you',
        width:600,
        height:300,
        //legend: 'none',
        //pieSliceText: 'label',
        /*slices: {  4: {offset: 0.2},
            12: {offset: 0.3},
            14: {offset: 0.4},
            15: {offset: 0.5},
        },*/
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);

    //Chart 2: High charts word cloud
    var rectext = [];
    var names_calories = [['Food Name', 'Calories']];
    var names_nutrition = [['Food Name', 'Protein (g)', 'Fat (g)', 'Total Sugars (g)', 'Cholesterol (mg)']]
    $(recommendations).each(function(i, v){
       // rectext.push(v['Food Name']);
        $(v['Food Name'].split(" ")).each(function(ind, val){
            rectext.push(val);

        });
        names_calories.push([v['Food Name'], parseInt(v['Energy (kcal) (kcal)'])]);
        names_nutrition.push([v['Food Name'], parseInt(v['Protein (g)']),
            parseInt(v['Fat (g)']), parseInt(v['Total sugars (g)']),
                parseInt(v['Cholesterol (mg)'])]);

    });
    console.log(names_calories);
    var wordcloud_data = [];
    var tempdata = "";
    wordcloud_data = Highcharts.reduce(rectext, function (arr, word) {
        var obj = Highcharts.find(arr, function (obj) {
            return obj.name === word;
        });
        if (obj) {
            obj.weight += 1;
        } else {
            obj = {
                name: word,
                weight: 1
            };
            arr.push(obj);
        }
        return arr;
    }, []);
    Highcharts.chart('wordcloud', {
        series: [{
            type: 'wordcloud',
            data: wordcloud_data,
            name: 'Occurrences'
        }],
        title: {
            text: 'Wordcloud from the Recommended Food Names'
        }
    });

    // Chart 3:  Calories per recommended food
    var data = google.visualization.arrayToDataTable(
        names_calories
    );

    var options = {
        title: 'Total calories per recommended food',
        chartArea: {width: '100%'},
        width:600,
        height:300,
        legend: 'none',
        colors: ['#b0120a', '#ffab91'],
        hAxis: {
            title: 'Energy Calories(kcal)',
           // minValue: 0
        },
        vAxis: {
            title: 'Food Name'
        }
    };
    var chart = new google.visualization.BarChart(document.getElementById('caloriesbar'));
    chart.draw(data, options);

    // Chart 4: Other nutrients per recommended food

    var data = google.visualization.arrayToDataTable(
        names_nutrition
    );

    var options = {
        title: 'Comparison of nurtients per recommended food',
        chartArea: {width: '100%'},
        width:600,
        height:300,
        bar: {groupWidth: "95%"},
        isStacked: true,
        //colors: ['#b0120a', '#ffab91'],
        hAxis: {
            title: 'Nutrient values',
            // minValue: 0
        },
        vAxis: {
            title: 'Food Name'
        }
    };
    var chart = new google.visualization.BarChart(document.getElementById('othersbar'));
    chart.draw(data, options);

}

function displayRecommendations(data) {
    var $row = $('<div>').addClass('row');
    var $column = $('<div>').addClass('col-sm-3');


    $.each(data, function(index, val) {

        var fname = val["Food Name"].split(" ")[0].replace(',', '');

      //  var foodindex = val["Food Name"].replace(',', '');
      //  foodindex = fname.replace(' ', '');

        var $div = $('<div>').addClass("card-deck shadow-lg p-3 mb-5 bg-white rounded").attr('style','width: 18rem;border:1px solid grey; margin-bottom:10px;margin-left:20px;').append(
            $('<img>').addClass("card-img-top").attr("src",'images/thumbs/' + fname + '.jpg'),
            $('<div>').addClass('card-body').append(
                $('<h5>').text(val["Food Name"]).append($('<span>').attr("id","favoriteIcon-" + fname).click( ()=> { favoriteFood('recommendations',val,fname)}).addClass("fa fa-star")),
                $('<ul>').addClass("list-group list-group-flush").attr('style', 'width:100%').append(
                    $('<li>').addClass('list-group-item').text("Energy (kcal): " + val["Energy (kcal) (kcal)"]),
                    $('<li>').addClass('list-group-item').text("Carbohydrate (g): " + val["Carbohydrate (g)"]),
                    $('<li>').addClass('list-group-item').text("Starch (g): " + val["Starch (g)"]),
                    $('<li>').addClass('list-group-item').text("Glucose (g):" + val["Glucose (g)"]),
                    $('<li>').addClass('list-group-item').text("Cholesterol (mg):" + val["Cholesterol (mg)"]),
                    $('<li>').addClass('list-group-item').text("Fat (g):" + val["Fat (g)"]),
                    $('<li>').addClass('list-group-item').text("Calcium (mg): " + val["Calcium (mg)"]),
                    $('<li>').addClass('list-group-item').text("Iron (mg):" + val["Iron (mg)"]),
                    $('<li>').addClass('list-group-item').text("Protein (g):" + val["Protein (g)"]),
                    $('<li>').addClass('list-group-item').text("Water (g):" + val["Water (g)"]),

                    //)
                ),

            ),
           // $('<a>').attr("data-toggle", "collapse")
             //   .attr("href", "#nutritionlist").text("View Nutrition data").attr('aria-controls', 'nutritionlst'),
            //$('<div>').attr('id', 'nutritionlst').addClass('collapse').append(

        );
        starFavorite(val["Food Name"],fname,'recommendations');

        $column.append($div);
        $row.append($column);
        $column = $('<div>').addClass('col-sm-3');
       // if (index == 2 || index == 5 || index== 8) {
        if ((index+1) %3 == 0) {
            $('#dashboard_recommend').append($row);
            $row = $('<div>').addClass('row');
        }
    });





    /*$.each(data, function(index, val) {
        var fname = val["Food Name"].split(" ")[0].replace(',', '')
        var $a = $('<a>').addClass("list-group-item list-group-item-action flex-column align-items-start")
            .append($('<div>').addClass("d-flex w-100 justify-content-between")
                    .append(
                        $('<h5>').text(val["Food Name"]),
                    ),
                $('<img>').attr("src",'images/thumbs/' + fname + '.jpg'),
                //  $('<p>').addClass("mb-1").text("Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit."),
                $('<ul>').addClass("mb-1").append(
                    $('<li>').text("Energy (kcal): " + val["Energy (kcal) (kcal)"]),
                    $('<li>').text("Carbohydrate (g): " + val["Carbohydrate (g)"]),
                    $('<li>').text("Starch (g): " + val["Starch (g)"]),
                    $('<li>').text("Glucose (g):" + val["Glucose (g)"]),
                    $('<li>').text("Cholesterol (mg):" + val["Cholesterol (mg)"]),
                    $('<li>').text("Fat (g):" + val["Fat (g)"]),
                    $('<li>').text("Calcium (mg): " + val["Calcium (mg)"]),
                    $('<li>').text("Iron (mg):" + val["Iron (mg)"]),
                    $('<li>').text("Protein (g):" + val["Protein (g)"]),
                    $('<li>').text("Water (g):" + val["Water (g)"]),

                )


            );

        $('#dashboard_recommend').append($a);

    });*/
}



function savepreferences(){
    var data = {
        user : sessionStorage.getItem('user'),
        water : document.getElementById('waterAmount').value,
        protein : document.getElementById('proteinAmount').value,
        fat : document.getElementById('fatAmount').value,
        carbohydrates : document.getElementById('carbohydratesAmount').value,   
        calories : document.getElementById('caloriesAmount').value,
        starch : document.getElementById('starchAmount').value,
        sugar : document.getElementById('sugarAmount').value,
        glucose : document.getElementById('glucoseAmount').value,
        cholestrol : 0,
        calcium : document.getElementById('calciumAmount').value,
        iron : document.getElementById('ironAmount').value,
    }
    var nutrition = [];
    nutrition.push(parseInt(data['water']));
    nutrition.push(parseInt(data['protein']));
    nutrition.push(parseInt(data['fat']));
    nutrition.push(parseInt(data['carbohydrates']));
    nutrition.push(parseInt(data['calories']));
    nutrition.push(parseInt(data['starch']));
    nutrition.push(parseInt(data['sugar']));
    nutrition.push(parseInt(data['glucose']));
    nutrition.push(parseInt(data['cholestrol']));
    nutrition.push(parseInt(data['calcium']));
    nutrition.push(parseInt(data['iron']));

    $.ajax({
        url: nodeURL + "savepreferences",
        type: 'POST',
        contentType: 'application/json',

        data: JSON.stringify(data),
    
        success: function (res) {

            $.ajax({
                url: pythonURL,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({nutrition: nutrition}),
                success: function(res) {
                    // console.log(res);
                }

            }).done(function(res){

                recommendations = JSON.parse(res);
                $('#dashboard_recommend').empty();
                displayRecommendations(JSON.parse(res));

                loadStatistics();

            });

        }
    })
}


function favoriteFood(origin, food, foodindex)
{
    console.log('attempting to favorite');
    console.log(food);
    var update = false;
    if(origin == 'search')
    {
       if(!($('#favIcon-'+foodindex).hasClass("checked")))
       {
             $("#favIcon-"+foodindex).addClass("checked");
             update = true;
       }
    }
    else 
    {  
        if(!($('#favoriteIcon-'+foodindex).hasClass("checked")))
        {
              $("#favoriteIcon-"+foodindex).addClass("checked");
              update = true;
        }
    }
    if(update)
    {

        console.log(favoritesAdded);

        favoritesAdded.push(food);
        console.log(favoritesAdded);
        localStorage.setItem('favoritesAdded',JSON.stringify(favoritesAdded));
    }
    
}


function removeFavorite(food)
{
    var found = false;
    for(var i = 0; i<favoritesAdded.length; i++)
    {
        if(favoritesAdded[i]["Food Name"]== food)
        {
            console.log(food);
            favoritesAdded.splice(i,1);
            localStorage.setItem('favoritesAdded', JSON.stringify(favoritesAdded));
            found = true;
            break;
        }     
    }
    if(!found)
    {
        favoritesRemoved.push(food);
        localStorage.setItem('favoritesRemoved',JSON.stringify(favoritesRemoved));
        
    }
    var foodindex = food.split(" ")[0].replace(',', '');
    $('#favoriteIcon-'+foodindex).removeClass('checked');
    $('#favIcon-'+foodindex).removeClass('checked');
    displayFavorites();
}

function retrieveFavorites()
    {

    $.ajax({
        url: nodeURL + 'favorite-foods',
        type: 'POST',
        dataType: 'json',
        data: {
            email : sessionStorage.getItem('user')
        },
        success: function (response) {
            favorites = favorites.concat(response);
        }
    })
};

function forgotpassword()
{
    
    console.log('forgot password');

    $("#signinModal").modal('hide');
    $.ajax({
        url: nodeURL + 'securityquestions',
        type: 'POST',
        dataType: 'json',
        data: {
            email :document.getElementById('signinEmailInput').value
        },
        success: function (response) {
            console.log(response[0].sec_ques1);
            document.getElementById('sq1').innerHTML = response[0].sec_ques1;
            document.getElementById('sq2').innerHTML = response[0].sec_ques2;
        }
    })
    $("#forgotpasswordModal").modal('show');

}

function checksecurity(){
    $.ajax({
        url: nodeURL + 'checksecurity',
        type: 'POST',
        dataType: 'json',
        data: {
            email :document.getElementById('sqEmailInput').value,
            ans1 : document.getElementById('s1ansInput').value,
            ans2 : document.getElementById('s2ansInput').value,
            ques1 : document.getElementById('sq1').innerHTML,
            ques2  : document.getElementById('sq2').innerHTML
        },
        success: function (response) {
            console.log(response);
            if(response.authenticated)
            {
                $("#forgotpasswordModal").modal('hide');
                $("#resetpasswordModal").modal('show');
            }
            else
            {
                document.getElementById('forgotpasswordAlert').innerHTML = "Sorry, either answer 1 or 2 is incorrect. Please try again.";
            }
        }
    })
}


function resetpassword(){
    console.log(document.getElementById('resetpasswordInput').value);
    $.ajax({
        url: nodeURL + 'resetpassword',
        type: 'POST',
        dataType: 'json',
        data: {
            email :document.getElementById('signinEmailInput').value,
            password : document.getElementById('resetpasswordInput').value,

        },

        success: function (response) {
            document.getElementById('resetAlert').innerHTML = "Password Successfully Reset";

            setTimeout(function(){
                 $("#resetpasswordModal").modal('hide');
                 window.location = "index.html";
            },1000)

        }
    })
}

function starFavorite(food,foodindex, index){
   // console.log(favorites);
    setTimeout(function star(){
    for(var i = 0 ; i<favorites.length; i++)
    {
        if(food == favorites[i]["Food Name"])
        {
           
            $("#favoriteIcon-" + foodindex).addClass("checked");
            $("#favIcon-" + foodindex).addClass("checked");
      
        }
    }
    for(var i = 0 ; i<favoritesAdded.length; i++)
    {
        if(food == favoritesAdded[i]["Food Name"])
        {
           
            $("#favoriteIcon-" + foodindex).addClass("checked");
            $("#favIcon-" + foodindex).addClass("checked");
      
        }
    }
    },2000)           

}

function displayFavorites()
{
    var display = favorites;

    for(var i = 0; i<display.length; i++)
        {
            for(j = 0; j<favoritesRemoved.length; j++)
            {
                if(display[i]["Food Name"]== favoritesRemoved[j])
                {
                    display.splice(i,1);
                    break;
                }
            }
        }
    
    //display = display.concat(favoritesAdded);
    console.log(display);
      $('#favoriteTable tbody').empty();
            $(display).each(function(i){

              var id = "favListIcon"+i; 
               $('#favoriteTable')
              .append($('<tr>')
              .append($('<td>').html(display[i]["Food Name"]),
               $('<td>').html(display[i]["Protein"]),
               $('<td>').html(display[i]["Fat"]),
               $('<td>').html(display[i]["Carbohydrate"]),
               $('<td>').html(display[i]["Total Sugars"]),
               $('<td>')
              .append($('<span>').addClass("fa fa-star checked").attr("id", id).click( ()=> {  removeFavorite(display[i]['Food Name']) }))
              ))
                
        })
        console.log(favoritesAdded);
        $(favoritesAdded).each(function(j){
            console.log('food');
            console.log(i);
            var id = "favListIcon"+i; 
             $('#favoriteTable')
            .append($('<tr>')
            .append($('<td>').html(favoritesAdded[j]["Food Name"]),
             $('<td>').html((favoritesAdded[j]["Protein (g)"]) ? favoritesAdded[j]["Protein (g)"] : favoritesAdded[j]["Protein"] ),
             $('<td>').html((favoritesAdded[j]["Fat (g)"]) ? favoritesAdded[j]["Fat (g)"] : favoritesAdded[j]["Fat"] ),
             $('<td>').html((favoritesAdded[j]["Carbohydrate (g)"])? favoritesAdded[j]["Carbohydrate (g)"] : favoritesAdded[j]["Carbohydrate"] ),
             $('<td>').html((favoritesAdded[j]["Total sugars (g)"]) ? favoritesAdded[j]["Total Sugars"] : favoritesAdded[j]["Total Sugars"] ),
             $('<td>')
            .append($('<span>').addClass("fa fa-star checked").attr("id", id).click( ()=> {  removeFavorite(favoritesAdded[j]['Food Name']) }))
            ))
              
      })



}

function checksecurityemail()
{
    console.log('check security');
    console.log(document.getElementById('sqEmailInput').value);
   $.ajax({
        url: nodeURL + 'securityquestions',
        type: 'POST',
        dataType: 'json',
        data: {
             email :document.getElementById('sqEmailInput').value
         },
        success: function (response) {
        if(response.length==1)
        {
            document.getElementById('sq1').innerHTML = response[0].sec_ques1;
            document.getElementById('sq2').innerHTML = response[0].sec_ques2;
            $("#forgotpassEmailModal").modal('hide');
            $("#forgotpasswordModal").modal('show');
        }
       else{
            document.getElementById('forgotpassEmailAlert').innerHTML = "No existing account with this email";
        }
        }
    })
                  

}

function forgotpassEmail()
{
    $("#signinModal").modal('hide');
    $("#forgotpassEmailModal").modal('show');

}