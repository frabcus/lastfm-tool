function query(q){
    return $.ajax({
        url: 'https://box.scraperwiki.com/zarino/lastfm/f2cf672ac2b8405/sqlite',
        dataType: 'JSON',
        data: {
            q: q
        }
    });
}

function pad(number, length) {
    var length = length || 2;
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function unpad(thing){
    return String(thing).replace(/^0+/, '');
}

function pluralise(number, plural_suffix, singular_suffix){
    var plural_suffix = plural_suffix || 's';
    var singular_suffix = singular_suffix || '';
	if(number == 1){
		return singular_suffix;
	} else {
		return plural_suffix;
	}
}

function ucfirst(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function round(num, decimals) {
    var decimals = decimals || 1;
	return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
}

function ordinal(n) {
   var s = ["th","st","nd","rd"], v = n % 100;
   return n + (s[(v-20)%10]||s[v]||s[0]);
}

function day_name(d, m, y){
    var day_object = new Date(y + '/' + pad(m) + '/' + pad(d));
    return day_names[day_object.getDay()];
}

function human_date(d, m, y){
    return ucfirst(day_name(d, m, y)) + ' ' + ordinal(d) + ' ' + ucfirst(month_names[m-1]) + ' ' + y;
}

function hslToRgb(h, s, l){
    // h, s, l must be numbers between 0 and 1
    // will return r, g, b as numbers between 0 and 255
    var r, g, b;
    if(s == 0){
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [r * 255, g * 255, b * 255];
}

function rgbToHex(r, g, b) {
    // r, g, b must be numbers between 0 and 255
    // will return a 6-character hex string, prepended with '#' 
    return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
}

function mix(color1, color2, amount){
    // arrange that hsl1 is always the colour with least hue.
    var hsl1 = [+color1[0], +color1[1], +color1[2]];
    var hsl2 = [+color2[0], +color2[1], +color2[2]];
    if(hsl1[0] > hsl2[0]) {
        var t = hsl1;                        
        hsl1 = hsl2;
        hsl2 = t;
    }
    // if the gap between hue 1 and hue 2 is > 180,
    // then interpolate the other way around.
    if(hsl2[0] - hsl1[0] > 180) {
        var t = hsl2;
        hsl2 = hsl1;
        hsl1 = t;
        hsl2[0] = +hsl2[0] + 360;
    }
    var h = (amount * hsl1[0] + (1 - amount) * hsl2[0]) % 360;
    var s = amount * hsl1[1] + (1 - amount) * hsl2[1];
    var l = amount * hsl1[2] + (1 - amount) * hsl2[2];
    return [h,s,l];
}

function generate_calendar(min_year, min_month, max_year, max_month){
    for(y = min_year; y <= max_year; y++){
        var first_month = 1;
        var last_month = 12;
        if(y == min_year){ first_month = min_month; }
        if(y == max_year){ last_month = max_month; }
        for(m = first_month; m <= last_month; m++){
            var last_day = days_in_month[m-1];
            if (m == 2 && ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0)) { // February only!
                last_day = 29;
            }
            var month = $('<div class="month">');
            for(d = 1; d <= last_day; d++){
                month.append('<div class="day empty ' + day_name(d, m, y) + '" data-year="' + y + '" data-month="' + pad(m) + '" data-day="' + pad(d) + '" title="' + human_date(d, m, y) + '"></div>');
            }
            $('#heatmap').append(month);
        }
        $('#heatmap').append('<div class="clearfix">');
    }
}

function plot_calendar_data(data){
    var max_scrobbles = 0;
    $.each(data, function(i, day){
        max_scrobbles = Math.max(max_scrobbles, day.n);
    });
    $.each(data, function(i, day){
        var shade = day.n / max_scrobbles;
        var hsl_list = mix([0,100,30], [55,100,90], parseFloat(shade).toFixed(3));
        $d = $('.day[data-year="' + day.y + '"][data-month="' + day.m + '"][data-day="' + day.d + '"]');
        $d.removeClass('empty').data('scrobbles', day.n).data('shade', shade);
        $d.attr('title', day.n + ' scrobble' + pluralise(day.n) + ' on ' + $d.attr('title'));
        $d.css({
            zIndex: Math.round(shade * 100),
            backgroundColor: rgbToHex.apply(this, hslToRgb(hsl_list[0]/360, hsl_list[1]/100, hsl_list[2]/100)),
            borderColor: rgbToHex.apply(this, hslToRgb(hsl_list[0]/360, hsl_list[1]/100, hsl_list[2]/100*0.65))
        });
    });
}

function plot_hourly_graph(hourly_totals){
    console.log(hourly_totals);
}

function list_tracks(tracks){
    console.log(tracks);
}

var day_names = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
var month_names = ['january','february','march','april','may','june','july','august','september','october','november','december'];
var days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

$(function(){

    $('body').append('<p class="loading">Loading last.fm data</p>');

    $.when(
        query("select strftime('%m', date(min(date), 'unixepoch')) as min_month, strftime('%Y', date(min(date), 'unixepoch')) as min_year, strftime('%m', date(max(date), 'unixepoch')) as max_month, strftime('%Y', date(max(date), 'unixepoch')) as max_year from scrobble;"),
        query("select strftime('%d', date(date, 'unixepoch')) as d, strftime('%m', date(date, 'unixepoch')) as m, strftime('%Y', date(date, 'unixepoch')) as y, count(date) as n from scrobble group by y, m, d;")
    ).done(function(boundaries, daily_totals){
        $('p.loading').remove();
        generate_calendar(
            boundaries[0][0]['min_year'],
            boundaries[0][0]['min_month'],
            boundaries[0][0]['max_year'],
            boundaries[0][0]['max_month']
        );
        plot_calendar_data(daily_totals[0]);
    }).fail(function(){
        $('p.loading').remove();
        alert('There was a problem contacting the API');
    });
    
    $('#heatmap').on('mouseenter', '.day:not(.empty)', function(){
        $(this).addClass('hover').css('z-index', 9000);
    }).on('mouseleave', '.day:not(.empty)', function(){
        $(this).removeClass('hover').css('z-index', Math.round($(this).data('shade') * 100));
    }).on('click', '.day:not(.empty)', function(){
        if($(this).is('.selected')){
            $(this).removeClass('selected');
        } else {
            $('#heatmap .selected').removeClass('selected');
            $(this).addClass('selected');
            var d = unpad($(this).data('day'));
            var m = unpad($(this).data('month'));
            var y = $(this).data('year');
            $('#sidebar').html('<p class="loading">Loading details for<br/>' + human_date(d, m, y) + '</p>');
            $.when(
                query("select strftime('%H', datetime(date, 'unixepoch')) as hour, count(date) as n from scrobble where strftime('%d', date(date, 'unixepoch')) = '" + pad(d) + "' and strftime('%m', date(date, 'unixepoch')) = '" + pad(m) + "' and strftime('%Y', date(date, 'unixepoch')) = '" + y + "' group by hour order by hour;"),
                query("select strftime('%H:%M', datetime(date, 'unixepoch')) as time, track.name as track, artist.name as artist from scrobble, track, artist where track.mbid=track_mbid and artist.mbid=artist_mbid and strftime('%d', date(date, 'unixepoch')) = '" + pad(d) + "' and strftime('%m', date(date, 'unixepoch')) = '" + pad(m) + "' and strftime('%Y', date(date, 'unixepoch')) = '" + y + "' order by date;")
            ).done(function(hourly_totals, tracks){
                $('#sidebar p.loading').remove();
                plot_hourly_graph(hourly_totals[0]);
                list_tracks(tracks[0]);
            }).fail(function(){
                $('#sidebar p.loading').remove();
                alert('There was a problem contacting the API');
            });
        }
    });
    
});