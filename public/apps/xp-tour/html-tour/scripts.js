var main_nav = ""; 
var sub_nav = "";

function setup() {
    if (main_nav && document.all[main_nav + "_spacer"]) {
        try { document.all[main_nav + "_spacer"].width = 15; } catch (e) {}
    }
    if (main_nav && document.all[main_nav]) {
        try { document.all[main_nav].removeAttribute('href'); } catch (e) {}
    }
    if (main_nav && document.all[main_nav + "_div"]) {
        try { document.all[main_nav + "_div"].className = 'nav_header_selected'; } catch (e) {}
    }
    if (main_nav && document.all[main_nav + "_img"]) {
        try { document.all[main_nav + "_img"].src = 'nav_' + main_nav + '_down.gif'; } catch (e) {}
    }

    if (sub_nav && document.all[sub_nav]) {
        try {
            if (document.all[sub_nav].className === 'nav_blue_balls') {
                document.all[sub_nav].className = 'nav_blue_balls_selected';
            } else if (document.all[sub_nav + "_img"] && document.all.big_img) {
                document.all[sub_nav + "_img"].src = main_nav + "_" + sub_nav + "_ghost.jpg";
                document.all.big_img.src = main_nav + "_" + sub_nav + "_big.jpg";
                document.all[sub_nav].className = 'ghost';
            }
            document.all[sub_nav].removeAttribute('href');
        } catch (e) {}
    }
    
    if (main_nav && document.all["bot_nav_" + main_nav]) {
        try {
            document.all["bot_nav_" + main_nav].className = 'nav_bottom_selected';
            document.all["bot_nav_" + main_nav].removeAttribute('href');
        } catch (e) {}
    }
}