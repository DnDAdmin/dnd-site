// I tried to use classes as much as possible to improve performance. As such, most functions add/remove class names to elements to alter the map.
// Some change a single atribute, and others, like zooming and panning, use javascript based animations.

var loopCheck = 0;
var zoomLvl = 1;
var scale = 1024 * zoomLvl * -1;
var spot1 = 0;
var spot2 = 0;
var dot_name = null;
var dot_type = null;
var clicking = false
var clicked = false
var slide = 0

var persp = 0;

var mouseX
var mouseY

function hover(icon, show) {
    if(show) {
        icon.classList.add('iconHoverOver')
        icon.classList.remove('iconHoverOut')
    } else {
        icon.classList.add('iconHoverOut')
        icon.classList.remove('iconHoverOver')
    }
}

var winX = window.innerWidth
var winY = window.innerHeight
// vv- moves the map proportionally with the screen when resized.
window.onresize = function() {
    var map = document.getElementById('background')
    var water = document.getElementById('map')
    var info = document.getElementById('infoCont')
    var infoBox = document.getElementById('info')
    
    if(window.innerHeight < winY) {
        var amntY = (winY - window.innerHeight) / 2
        map.style.marginTop = parseInt(map.style.marginTop) - parseInt(amntY) + 'px'
        
    } else {
        var amntY = (window.innerHeight - winY) / 2
        map.style.marginTop = parseInt(map.style.marginTop) + parseInt(amntY) + 'px'
    }

    if(window.innerWidth < winX) {
        var amntX = (winX - window.innerWidth) / 2
        map.style.marginLeft = parseInt(map.style.marginLeft) - parseInt(amntX) + 'px'
        
    } else {
        var amntX = (window.innerWidth - winX) / 2
        map.style.marginLeft = parseInt(map.style.marginLeft) + parseInt(amntX) + 'px'
    }

    water.style.backgroundPositionY =  map.style.marginTop;
    water.style.backgroundPositionX =  map.style.marginLeft;
    winY = window.innerHeight
    winX = window.innerWidth

    info.style.height = ((infoBox.offsetHeight - info.offsetTop) - footer.offsetHeight) - 6 + 'px'
}

var curValue = 907
var slider = document.getElementById("myRange");
var output = document.getElementById("year");

// vv- opens right hand menu panel
function toggleMenu() {
    var menu = document.getElementById("menu");
    var infoBox = document.getElementById("info");
    var button = document.getElementById('menuBut')
    if(menu.classList.contains('menuOpen')) {
        menu.classList.remove('menuOpen')
        menu.classList.add('menuClose')
        button.classList.remove("change")
    } else {
        menu.classList.remove('menuClose')
        menu.classList.add('menuOpen')
        button.classList.add("change")
        if(infoBox.classList.contains('infoOpen')) {
            toggleInfoBox(true)
        }
    }
}

// vv- If mouse is scrolled while over map, activates scrolling functions.
var map = document.getElementById('map')
map.addEventListener("wheel", event => {
    if(event.deltaY > 0) {
        zoomOut(.1)
    } else {
        zoomIn(.1)
    }
    mousePos(event)
})

// Handles zooming in (duh)
function zoomIn(amnt) {
    if(zoomLvl < 3.5) {
        var myImg = document.getElementById("background");
        var map = document.getElementById("mapImage")
        var top = parseInt(myImg.style.marginTop);
        var left = parseInt(myImg.style.marginLeft);
        var water = document.getElementById('map')
        var size = parseInt(myImg.children[0].clientHeight);
        var allDots = document.getElementById("allDots").children;
        // amnt is used to determin if zoom is from scroll wheel or zoom button.
        if(persp < 45) {
            persp += 3
        }
        if(amnt == .5) {
            // zoom button scroll. Uses interval animation
            var change = ((Math.round(zoomLvl*2) / 2) + amnt) - zoomLvl.toFixed(1)
            var goal = zoomLvl + change
            var id = setInterval(frame, 10);
            var value = 0;
            if(goal > 3.5) {
                goal = 3.5
            }
            
            function frame(){
                if(zoomLvl > goal){
                    zoomLvl = roundHalf(zoomLvl)
                    moveThem(false)
                    clearInterval(id);
                }
                else{
                    zoomLvl += .02
                    value = (1024 * zoomLvl) - size
                    if(zoomLvl > 2.5) {
                        shift()
                    }
                    moveThem(false)
                }
            }
        } else {
            // scroll wheel zoom. Just shifts everything once by changed amount, no animation.
            zoomLvl = round10(zoomLvl + amnt)
            value = ((1024 * zoomLvl) - size)
            
            if(zoomLvl > 2.5) {
                shift()
            }
            moveThem(true)
        }

        // Both zooming methods use this function the adjust the map and locations.
        function moveThem(mouse) {
            var difY
            var difX
            var moveY
            var moveX

            if(mouse) {
                difY = ((mouseY / (zoomLvl - amnt)) * zoomLvl) - mouseY
                difX = ((mouseX / (zoomLvl - amnt)) * zoomLvl) - mouseX

                moveY = myImg.offsetTop - difY
                moveX = myImg.offsetLeft - difX
            } else {
                moveY = (top - (value / 2));
                moveX = (left - (value / 2));
            }

            

            myImg.style.marginTop = moveY + 'px';
            myImg.style.marginLeft = moveX + 'px';            

            
            myImg.style.height = (1024 * zoomLvl) + "px";
            myImg.style.width = (1024 * zoomLvl) + "px";

            // myImg.style.perspective = '1000px'
            // map.style.transform = 'rotateX(10deg)'
            // myImg.style.height = (parseInt(myImg.style.height) + (persp * 10)) + 'px'
            
            water.style.backgroundPositionY =  myImg.style.marginTop;
            water.style.backgroundPositionX =  myImg.style.marginLeft;
            water.style.backgroundSize = (size + value) + "px " + (size + value) + "px";

            // Moves each location
            for(i = 0; i < allDots.length; i++) {
                allDots[i].style.left = parseInt(allDots[i].children[0].style.left) * zoomLvl + 'px'
                allDots[i].style.top = parseInt(allDots[i].children[0].style.top) * zoomLvl + 'px'
                if(allDots[i].classList.contains('text')) {
                    allDots[i].style.fontSize = (21 * zoomLvl) +'pt'
                }
            }

            scale = 1024 * zoomLvl * -1;
        }

        // if beyond a zoom level it changes the location icons.
        function shift() {
            if(zoomLvl < 2.7) {
                toggleCheck('country', false)
                toggleCheck('ocean', false)
                toggleCheck('borders', false)
            }
        }
    }
}

// zoom out function (duh again)
// works the same as zoomin, just in reverse
function zoomOut(amnt) {
    if(zoomLvl > .6) {
        var myImg = document.getElementById("background");
        var top = parseInt(myImg.style.marginTop);
        var left = parseInt(myImg.style.marginLeft);
        var water = document.getElementById('map')
        var size = parseInt(myImg.children[0].clientHeight);
        var allDots = document.getElementById("allDots").children;
        
        if(persp > 0) {
            persp -= 3
        }

        if(amnt == .5) {
            var change = zoomLvl - ((Math.round(zoomLvl*2) / 2) - amnt)
            var goal = zoomLvl - change
            var id = setInterval(frame, 10);
            var value = 0;
            if(goal < .5) {
                goal = .5
            }
            
            function frame(){
                if(zoomLvl < goal){
                    zoomLvl = roundHalf(zoomLvl)
                    moveThem(false)
                    clearInterval(id);
                }
                else{
                    zoomLvl = zoomLvl - .02;
                    value = (1024 * zoomLvl) - size
                    if(zoomLvl < 2.51) {
                        shift()
                    }
                    moveThem(false)
                }
            }
        } else {
            zoomLvl = round10(zoomLvl - amnt);
            value = (1024 * zoomLvl) - size
            if(zoomLvl < 2.51) {
                shift()
            }
            moveThem(true)
        }

        function moveThem(mouse) {
            var stopNumy = window.innerHeight - (150 * zoomLvl);
            var stopNumx = window.innerWidth - (150 * zoomLvl);
            var difY
            var difX
            var moveY
            var moveX

            if(mouse) {
                difY = ((mouseY / zoomLvl) * (zoomLvl + amnt)) - mouseY
                difX = ((mouseX / zoomLvl) * (zoomLvl + amnt)) - mouseX

                moveY = myImg.offsetTop + difY
                moveX = myImg.offsetLeft + difX
            } else {
                moveY = (top - (value / 2));
                moveX = (left - (value / 2));
            }

            // myImg.style.transform = 'rotateX(' + persp + 'deg)'

            myImg.style.marginTop = moveY + 'px';
            myImg.style.marginLeft = moveX + 'px';  
            
            myImg.style.height = (1024 * zoomLvl) + "px";
            myImg.style.width = (1024 * zoomLvl) + "px";

            for(i = 0; i < allDots.length; i++) {
                allDots[i].style.left = (parseInt(allDots[i].children[0].style.left) * zoomLvl) + 'px'
                allDots[i].style.top = (parseInt(allDots[i].children[0].style.top) * zoomLvl) + 'px'
                if(allDots[i].classList.contains('text')) {
                    allDots[i].style.fontSize = (21 * zoomLvl) +'pt'
                }
            }
            
            // --vv-- Keeps map in the screen when zooming out.
            if(myImg.offsetTop < scale + (210 * zoomLvl)) {
                myImg.style.marginTop = (scale + (210 * zoomLvl)) + 1 + "px";
            }
            else{
                if(myImg.offsetTop > stopNumy) {
                    myImg.style.marginTop = stopNumy - 1 + "px";
                }
            }

            if(myImg.offsetLeft < scale + (210 * zoomLvl)) {
                myImg.style.marginLeft = (scale + (210 * zoomLvl)) + 1 + 'px'
            }
            else{
                if(myImg.offsetLeft > stopNumx){
                    myImg.style.marginLeft = stopNumx - 1 + "px";
                }
            }
            // --^^--

            water.style.backgroundPositionY =  myImg.style.marginTop;
            water.style.backgroundPositionX =  myImg.style.marginLeft;
            water.style.backgroundSize = (size + value) + "px " + (size + value) + "px";

            scale = 1024 * zoomLvl * -1;
        }

        function shift() {
            toggleCheck('country', true)
            toggleCheck('ocean', true)
        }
    }
}

// Math functions for zooming.
function roundHalf(num) {
    return Math.round(num*2)/2;
}
function round10(num) {
    return Math.round(num * 10) / 10;
}

// Handles map panning. This was copied and modified from an online form, so I don't fully understand it.
function dragElement(win) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    // Move the DIV from anywhere inside the DIV:
    win.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }


    function elementDrag(e) {
        var stopNumy = window.innerHeight - (150 * zoomLvl);
        var stopNumx = window.innerWidth - (150 * zoomLvl);
        
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // set the element's new position:
        var elmnt = document.getElementById('background')
        var water = document.getElementById('map')
        
        // --vv-- Moves the map. All the if and elses are to keep the map contrained in the window.
        if(elmnt.offsetTop < scale + (210 * zoomLvl)) {
            elmnt.style.marginTop = (scale + (210 * zoomLvl)) + 1 + "px";
        }
        else{
            if(elmnt.offsetTop > stopNumy) {
                elmnt.style.marginTop = stopNumy - 1 + "px";
            } else {
                elmnt.style.marginTop = (elmnt.offsetTop - pos2) + "px";
                win.style.cursor = "grabbing";
            }
        }

        
        if(elmnt.offsetLeft < scale + (210 * zoomLvl)) {
            elmnt.style.marginLeft = (scale + (210 * zoomLvl)) + 1 + 'px'
        }
        else{
            if(elmnt.offsetLeft > stopNumx){
                elmnt.style.marginLeft = stopNumx - 1 + "px";
            }
            else{
                win.style.cursor = "grabbing";
                elmnt.style.marginLeft = (elmnt.offsetLeft - pos1) + "px";                
            }
        }
        water.style.backgroundPositionY =  elmnt.style.marginTop;
        water.style.backgroundPositionX =  elmnt.style.marginLeft;
        // --^^--
    }

    

    function closeDragElement() {
        // stop moving when mouse button is released:
        var dragElmnt = document.getElementById("map");
        dragElmnt.style.cursor = "grab";
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


// When the page is loaded it runs through this function (which runs through other functions) before hiding the splash screen.
async function loadMap(time) {
    var allCheck = document.getElementById('all')
    
    await loadImages()
    await setPos(time)
    allCheck.children[0].checked = false
    await setChecks()

    

    var window = document.getElementById('window')
    var splash = document.getElementById('splash')
    
    window.style.visibility = 'visible';
    splash.classList.add("splashAfter");
    splash.children[1].classList.remove('loadingText')
}

// Checks to ensure all images are loaded in, then triggers the next load up function.
function loadImages() {
    return new Promise(resolve => {
        var loadedImages = []

        var images = document.images
        var len = images.length
        var counter = 0;

        // Gets all images and checks that each is loaded then incriments a counter
        for(i = 0; i < len; i++) {
            var img = images[i]
            if(img.complete) {
                incrementCounter();
            } else {
                img.addEventListener('load', incrementCounter, false );
            }
        }

        // Loads the additional images that arent on the page on start up.
        for(i = 0; i < loadedImages.length; i++) {
            var img = loadedImages[i]
            if(img.complete) {
                incrementCounter();
            } else {
                img.addEventListener( 'load', incrementCounter, false );
            }
        }
        
        // Increases image load counter, then when finished resolves the funtion.
        function incrementCounter() {
            counter++;
            if ( counter === len + loadedImages.length) {
                resolve()
            }
        }
    })
}

// Ensures that all elements are in their appropriate positions.
function setPos(time) {
    return new Promise(resolve => {
        
        var elmnt = document.getElementById('background')
        var water = document.getElementById('map')
        var dots = document.getElementById('allDots').children

        var sizeX = (window.innerWidth - 1024) / 2
        var sizeY = (window.innerHeight - 1024) / 2
        
        elmnt.style.marginLeft = sizeX + 'px';
        elmnt.style.marginTop = sizeY + 'px';

        water.style.backgroundPositionY =  elmnt.offsetTop + 'px';
        water.style.backgroundPositionX =  elmnt.offsetLeft + 'px';

        // Ensured the placing of each dot.
        for(i = 0; i < dots.length; i++) {
            dot = dots[i]
            if(!dot.classList.contains('text')) {
                dot.children[1].style.marginLeft = (parseInt(dot.children[1].offsetWidth) / 2) * -1 + 'px'
            }
        }
        // This is the last function, so an interval here garentees that the splash screen will remain up for at least one second.
        setTimeout(resolve, time);
    })
}

// Sets the check boxes to the corrent setting on loadup.
function setChecks() {
    return new Promise(resolve => {
        var checkBoxes = document.getElementById('toggles').children
        for(i = 0; i < checkBoxes.length; i++) {
            var box = checkBoxes[i].children[0]
            if(i > 0) {
                box.checked = true
            }
        }
        resolve()
    })
}

// Function for when a location is selected.
function select(id) {
    var loc = document.getElementById(id)
    var sel = document.getElementById(id + 'Sel')
    var off = false
    if(loc.classList.contains('selected')) {
        off = true
    }
    deSelAll()
    if(!off) {
        if(!loc.classList.contains('text') || loc.classList.contains('textSel')) {
            toggleSpecLoc(id, true)
            loc.classList.add('selected')
            loc.classList.remove('hideIcon')
            loc.classList.add('showIcon')
            
            sel.innerHTML = '(Deselect)'
            sel.style.color = 'rgb(201, 184, 36)'
        }
    }
    toggleInfoBox(off, loc)
}

// Deselects all locations on the map.
function deSelAll() {
    var dots = document.getElementById('allDots').children
    var sels = document.getElementsByClassName('checkMain')
    for(i = 0; i < dots.length; i++) {
        var dot = dots[i]
        var sel = sels[i]
        
        if(dot.classList.contains('selected')) {
            dot.classList.add('iconHoverOut')
        }
        dot.classList.remove('iconHoverOver')
        dot.classList.remove('selected')
        
        if(sel.children[1]) {
            sel.children[1].innerHTML = '(Select)'
            sel.children[1].style.color ='unset'
        }
    }
}

// Opens right hand info panel.
function toggleInfoBox(close, loc) {
    var box = document.getElementById('info')
    var info = document.getElementById('infoCont')
    var menu = document.getElementById('menu')
    
    var galButs = document.getElementById('galButs')
    
    if(box.classList.contains('infoOpen') && close) {
        box.classList.remove('infoOpen')
        box.classList.add('infoClose')
        box.children[0].style.display = 'none'
        info.style.height = '100%'
        // box.children[1].children[0].children[0].style.display = 'none'
        deSelAll()
    } else {
        insertInfo(loc)
        box.classList.remove('infoClose')
        box.classList.add('infoOpen')
        box.children[0].style.display = 'block'
        if(menu.classList.contains('menuOpen')) {
            toggleMenu()
        }
    }
}

// Loads location info into right hand info panel.
async function insertInfo(loc) {
    var title = loc.children[1].innerHTML
    var info = loc.children[2].innerHTML
    var infoCont = document.getElementById('infoCont')
    var box = document.getElementById('info')
    var boxImage = document.getElementById('infoImage')
    var img = document.getElementById("icon" + loc.id)
    var galBut = document.getElementById('galButs')
    var caption = document.getElementById('caption').children[0]
    var footer = document.getElementById('footer')
    box.children[1].children[0].children[1].innerHTML = title
    box.children[1].children[2].innerHTML = info

    boxImage.innerHTML = ""
    caption.innerHTML = ""
    galBut.style.display = 'none'

    infoCont.style.height = '100%'

    if(img) {
        box.children[1].children[0].children[0].style.display = 'block'
        box.children[1].children[0].children[0].children[0].children[0].src = img.src
    } else {
        box.children[1].children[0].children[0].style.display = 'none'
    }

    if(loc.children[3]) {
        if(loc.children[3].id == 'locImage') {
            for(var i = 0; i < loc.children[3].children.length; i++) {
                var img = loc.children[3].children[i]
                var newDiv = document.createElement('div')
                var newP = document.createElement('p')
                var newImg = document.createElement('img')

                newDiv.classList.add('infoImageDiv')
                if(i > 0) {
                    newDiv.classList.add('hide')
                } else {
                    newDiv.classList.add('show')
                    caption.innerHTML = img.children[1].innerHTML
                }
                newImg.classList.add('infoImage')
                newP.style.display = 'none'
                newP.innerHTML = img.children[1].innerHTML
                newImg.src = img.children[0].innerHTML
                // newImg.onclick =  function(){window.open("/", "_blank")}
                // newImg.style.cursor = 'pointer'
                // newImg.title = 'View in new tab.'

                newDiv.appendChild(newImg)
                newDiv.appendChild(newP)
                boxImage.appendChild(newDiv)
            }
            // boxImage.children[0].classList.add('show')
            // boxImage.children[0].classList.remove('hide')
            // boxImage.src = loc.children[3].innerHTML
            box.children[1].children[3].style.display = 'block';
        } else {
            if(loc.children[4]) {
                if(loc.children[4].id == 'locImage') {
                    for(var i = 0; i < loc.children[4].children.length; i++) {
                        var img = loc.children[4].children[i]
                        var newDiv = document.createElement('div')
                        var newP = document.createElement('p')
                        var newImg = document.createElement('img')
        
                        newDiv.classList.add('infoImageDiv')
                        if(i > 0) {
                            newDiv.classList.add('hide')
                        } else {
                            newDiv.classList.add('show')
                            caption.innerHTML = img.children[1].innerHTML
                        }
                        newImg.classList.add('infoImage')
                        newP.style.display = 'none'
                        newP.innerHTML = img.children[1].innerHTML
                        newImg.src = img.children[0].innerHTML
                        // newImg.onclick =  function(){window.open("/", "_blank")}
                        // newImg.style.cursor = 'pointer'
                        // newImg.title = 'View in new tab.'
        
                        newDiv.appendChild(newImg)
                        newDiv.appendChild(newP)
                        boxImage.appendChild(newDiv)

                    }
                    // boxImage.children[0].classList.add('show')
                    // boxImage.children[0].classList.remove('hide')
                    // boxImage.src = loc.children[4].innerHTML
                    box.children[1].children[3].style.display = 'block';
                }
                footer.style.height = footer.offsetHeight + 'px'
            } else {
                box.children[1].children[3].style.display = 'none';
            }
        }
        if(boxImage.children.length > 1) {
            galBut.style.display = 'block'
        }
        box.children[1].children[2].style.height = (box.children[1].children[2].offsetHeight - footer.offsetHeight) - 6 + 'px'
    } else {
        box.children[1].children[3].style.display = 'none';
    }
}

// Toggles checkmarks on or off
function toggleCheck(item, val) {
    var check = document.getElementById(item + 'Check')
    if(check) {
        if(val != null) {
            check.checked = val
        } else {
            if(check.checked) {
                check.checked = false
            } else {
                check.checked = true
            }
        }
        if(item == 'city') {
            var capCheck = document.getElementById('capitalCheck')
            capCheck.checked = check.checked
        }
        if(item == 'borders') {
            var img = document.getElementById("mapImage")
            if(check.checked) {
                img.src = '/images/map/borders.png'
            } else {
                img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
            }
            
        } else {
            toggleLoc(item)
        }
        checkAllChecks()
    }
}

// Toggles a location based on if its part of the category of the current checkbox
function toggleLoc(type) {
    var locs = document.getElementsByClassName(type)
    var box = document.getElementById(type + 'Check')
    for(i = 0; i < locs.length; i++) {
        var loc = locs[i]
        var specCheck = document.getElementById(loc.id + 'Check')
        if(box.checked) {
            specCheck.checked = true
            loc.classList.add('showIcon')
            loc.classList.remove('hideIcon')
        } else {
            specCheck.checked = false
            loc.classList.add('hideIcon')
            loc.classList.remove('showIcon')
        }
    }
}

// Toggles the "all" check box if all the check boxes are checked.
function checkAllChecks() {
    var checkBoxes = document.getElementById('toggles').children
    var allCheck = document.getElementById('allCheck')
    var part = false
    var allChecked = true
    for(i = 0; i < checkBoxes.length; i++) {
        var box = checkBoxes[i].children[0]
        if(box.id != 'allCheck') {
            if(box.checked == false) {
                allChecked = false
            } else {
                part = true
            }
        }
    }

    if(allChecked) {
        allCheck.parentNode.children[1].style.display = 'block'
        allCheck.parentNode.children[2].style.display = 'none'
        allCheck.checked = true
    } else {
        if(part) {
            allCheck.checked = true
            allCheck.parentNode.children[1].style.display = 'none'
            allCheck.parentNode.children[2].style.display = 'block'
        } else {
            allCheck.parentNode.children[1].style.display = 'block'
            allCheck.parentNode.children[2].style.display = 'none'
            allCheck.checked = false
        }
    }
}

// If all check box is checked it toggles all the other check boxes and their loactions.
function toggleAllChecks(allBox) {
    var checkBoxes = document.getElementById('toggles').children
    var checked = false

    allBox.children[1].style.display = 'block'
    allBox.children[2].style.display = 'none'

    if(!allBox.children[0].checked) {
        checked = true
    }
    allBox.children[0].checked = checked
    
    for(i = 0; i < checkBoxes.length - 1; i++) {
        var box = checkBoxes[i].children[0]
        if(i > 0) {
            var locs = document.getElementsByClassName(checkBoxes[i].id)
            box.checked = checked
            for(j = 0; j < locs.length; j++) {
                var loc = locs[j]
                var specCheck = document.getElementById(loc.id + 'Check')
                if(checked) {
                    specCheck.checked = true
                    loc.classList.add('showIcon')
                    loc.classList.remove('hideIcon')
                } else {
                    specCheck.checked = false
                    loc.classList.add('hideIcon')
                    loc.classList.remove('showIcon')
                }
            }
            if(box.id == 'bordersCheck') {
                var img = document.getElementById("mapImage")
                if(checked) {
                    img.src = '/images/map/borders.png'
                } else {
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                }
            }
        }
    }
}

// Toggles locations selected from the specific check boxes list.
function toggleSpecLoc(loc, on) {
    var specLoc = document.getElementById(loc)
    var check = document.getElementById(loc + 'Check')

    if(on || !check.checked) {
        check.checked = true
        specLoc.classList.add('showIcon')
        specLoc.classList.remove('hideIcon')
    } else {
        check.checked = false
        specLoc.classList.add('hideIcon')
        specLoc.classList.remove('showIcon')
    }
}

// Opens the credits and copyright box.
function toggleCredits(show) {
    var credits = document.getElementById('credits')
    if(show) {
        credits.style.display = 'block'
    } else {
        credits.style.display = 'none'
    }
}

// Prevents page from scrolling when mouse is over window. This is would only be noticed when included in another page.
function stopScroll() {
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden"
}
function startScroll() {
    document.body.style.height = "unset";
    document.body.style.overflow = "visible"
}

// Controls the text on the lower right of the screen. Should be hidden when the map is not being worked on.
function myAlert(text){
    var errText = document.getElementById("print");
    errText.style.visibility = "visible";
    errText.innerHTML = text;
}

// Uses the MyAlert text to show mouse position for loaction placement.
function mousePos(e){
    var img = document.getElementById("background");
    var x = e.clientX - img.offsetLeft;
    var y = e.clientY - img.offsetTop;
    mouseX = x
    mouseY = y
    // var text = "y = " + y + ", x = " + x + ' | zoom: ' + zoomLvl;
    var text = "y = " + mouseY + ", x = " + mouseX + ' | zoom: ' + zoomLvl;
    // myAlert(text);
}


var slide = 0
async function galSlide(left) {
    var images = document.getElementById('infoImage').children
    var caption = document.getElementById('caption').children[0]
    var currSlide

    for(i = 0; i < images.length; i++) {
        var img = images[i]
        if(img.classList.contains('showL') || img.classList.contains('showR') || img.classList.contains('show')) {
            currSlide = i
            break
        }
    }

    images[currSlide].classList.remove('hideL')
    images[currSlide].classList.remove('showL')
    images[currSlide].classList.remove('hideR')
    images[currSlide].classList.remove('showR')
    images[currSlide].classList.remove('show')
    images[currSlide].classList.remove('hide')
    caption.innerHTML = ""

    if(left) {
        images[currSlide].classList.add('hideL')
        if(currSlide == 0) {
            currSlide = images.length - 1
        } else {
            currSlide -= 1
        }
        images[currSlide].classList.remove('hideL')
        images[currSlide].classList.remove('hideR')
        images[currSlide].classList.remove('hide')
        images[currSlide].classList.add('showR')
    } else {
        images[currSlide].classList.add('hideR')
        if(currSlide == images.length - 1) {
            currSlide = 0
        } else {
            currSlide += 1
        }
        images[currSlide].classList.remove('hideL')
        images[currSlide].classList.remove('hideR')
        images[currSlide].classList.remove('hide')
        images[currSlide].classList.add('showL')
    }
    caption.innerHTML = images[currSlide].children[1].innerHTML
}

function sizeUp(bar) {
    var pos1 = 0, pos2 = 0;
    var footer = document.getElementById('footer')
    var info = document.getElementById('infoCont')
    var infoBox = document.getElementById('info')
    bar.onmousedown = dragBar;

    function dragBar(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup:
        pos2 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementSize;
    }
    
    function elementSize(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos2 - e.clientY;
        pos2 = e.clientY;

        footer.style.height = (parseInt(footer.style.height) + pos1) + 'px'
        info.style.height = ((infoBox.offsetHeight - info.offsetTop) - footer.offsetHeight) - 6 + 'px'

    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function sizeLeft(bar) {
    var pos1 = 0, pos2 = 0;
    var box = document.getElementById('info')
    bar.onmousedown = dragBar;
    function dragBar(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup:
        pos2 = e.clientX;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementSize;
    }
    
    function elementSize(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos2 - e.clientX;
        pos2 = e.clientX;

        box.style.width = (parseInt(box.style.width) + pos1) + 'px'
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


