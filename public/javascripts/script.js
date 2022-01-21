// Function for opening and closing the mobile menu
function toggleMobileMenu() {
    var mobileMenu = document.getElementById('mobileMenBox')
    var mobileBut = document.getElementById('mobileBut')

    mobileBut.classList.toggle("change");
    mobileMenu.classList.toggle('mobMenShow')
    
}

// Stops scrolling when interacting with the map.
function disableScroll() {
    var body = document.getElementById('mainBody')
    var bodWidth = body.offsetWidth
    body.style.overflow = 'hidden'
    if(body.offsetWidth > bodWidth) {
        body.style.paddingRight = (body.offsetWidth - bodWidth) + 'px'
    }
}

// Reenables scrolling when not interacting with the map.
function enableScroll() {
    var body = document.getElementById('mainBody')
    body.style.overflow = 'unset'
    body.style.paddingRight = 'unset'
}

const protected = document.querySelectorAll('[data-blockRight]');
var prot = false
protected.forEach(el => el.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    prot = true
    showToolTip('text')
    return false;
}, false))

protected.forEach(el => el.addEventListener('mousemove', ev => {
    if(toolTip.classList.contains('show') && prot) {
        prot = false
        hideToolTip()
    }
}))


// VV-- This section handles the custom tool tip.
const tipLinks = document.querySelectorAll('[data-tip]'); // This grabs all items with the data-tip attribute.
var toolTip = document.getElementById('toolTip')
var showTimeOut
var hideTimeOut


// calls the showtooltip function when mouse moves over a link with the data-tip attribute.
tipLinks.forEach(el => el.addEventListener('mousemove', function() {
    showToolTip(el.getAttribute("data-tip"), 500)
}));

// calls the hide tooltip function when mouse leaves the link
tipLinks.forEach(el => el.addEventListener('mouseout', hideToolTip));

// This sets the text and display delay of the tooltip based in the two variables, sets it location, then displays it.
function showToolTip(text, delay) {
    var winHeight = window.innerHeight
    var e = window.event
    var x = e.pageX; // tool tip location is set based on mouse position in the viewport.
    var y = e.pageY;

    toolTip.classList.remove('flipX')
    toolTip.classList.remove('flipY')
    
    // these two 'if's change the style and location of the tooltip if the mouse is close to the edge of the viewport.
    if(x < toolTip.offsetWidth) {
        toolTip.classList.add('flipX')
    }
    if(y > winHeight - toolTip.offsetHeight) {
        toolTip.classList.add('flipY')
    }
        

    toolTip.style.left  = x+"px";
    toolTip.style.top  = y+"px";

    toolTip.children[0].innerHTML = text // tool tip text is determined by the contents of the custom data-tip attribute.
    clearTimeout(showTimeOut)
    clearTimeout(hideTimeOut)
    // A delay for the tool tip to display
    if(!toolTip.classList.contains('show')) {
        
        showTimeOut = setTimeout(function(){
            toolTip.classList.add('show')
        }, delay);
    }
}
// resets and hides the tool tip when the mouse leaves the item.
function hideToolTip() {
    clearTimeout(showTimeOut)
    toolTip.classList.remove('show')
    hideTimeOut = setTimeout(function() {
        toolTip.style.left = 0;
        toolTip.style.top = 0;
    }, 500)
}


// Changes the text of file inputs based on the name of selected files.
function getFileNames(input) {
    var fileText = input.parentNode.parentNode.children
    var text
    if(input.files.length > 1) {
        text = input.files.length + ' files selected'
    } else {
        if(input.files.length > 0) {
            text = input.files[0].name
        } else {
            text = 'No file(s) selected'
        }
    }
    for(var i = 0; i < fileText.length; i++) {
        var node = fileText[i]
        if(node.classList.contains('formFilesSelected')) {
            node.innerHTML = text
            node.style.display = 'unset'
            break
        }
    }
    
}

function updateInput() {
    return new Promise(resolve => {
        var editors = document.getElementsByClassName('richEdit')
        for(var i = 0; i < editors.length; i++) {  
            var thisEdit = editors[i]
            
            var input = document.getElementById(thisEdit.getAttribute('data-name'))
            if(thisEdit.children[0].innerHTML.length > 12) {
                input.value = thisEdit.children[0].innerHTML 
            } else {
                input.value = ''
            }
        }
        resolve()
    })
}

function compDB(db, col, key, value, exempt) {
    return new Promise(resolve => {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                if(this.responseText == 'true') {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        };
        xhttp.open("POST", "/forms/checkfordbitem", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({"db": db, "col": col, "key": key, "value": value, "exempt": exempt}));
    })
}

function updateDB(url, data) {
    return new Promise(resolve => {
        
        var xhttp = new XMLHttpRequest();
        
        xhttp.responseType = 'json'

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve('success')
            }
        };

        xhttp.open("POST", url, true);
        xhttp.send(data);
    })
}

// div#userMenuBack(class='d-none d-sm-block')
//         div#userMenMain
//             div#userMenu
//                 div(class='userMenLink')
//                     a(href='/users/dashboard' class='menDeskLink') Dashboard
//             div#userMenHead
//                 div#userMenName
//                     h5= user.userName

function toggleUserMen() {
    var menBack = document.getElementById('userMenuBack')
    var menMain = document.getElementById('userMenMain')
    var arrow = document.getElementById('userMenArrow')

    if(menMain.classList.contains('visible')) {
        menMain.classList.remove('visible')
        menBack.classList.remove('visible')
        arrow.classList.remove('toggled')
    } else {
        menMain.classList.add('visible')
        menBack.classList.add('visible')
        arrow.classList.add('toggled')
    }
}

var toolbarOptions = [
    ['bold', 'italic', 'underline'],
            
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],                       

    [{ 'color': [] }, { 'background': [] }],

    ['link', 'image']
];


var editors = document.getElementsByClassName('richEdit')
if(editors.length > 0) {
    for(var i = 0; i < editors.length; i++) {
        var thisEdit = editors[i]
        new Quill(thisEdit, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        image: imageHandler
                    }
                }
            },
            placeholder: thisEdit.getAttribute('data-placeHolder')
        })
        thisEdit.children[0].tabIndex = thisEdit.getAttribute('data-tab')
    }
}


function imageHandler() {
    var range = this.quill.getSelection();
    var value = prompt('What is the image URL');
    if(value){
        this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
    }
}

function setFields(){
    var boxes = document.getElementsByClassName('richEdit')
    for(var i = 0; i < boxes.length; i++) {
        var textBox = boxes[i].children[0]

        var name = boxes[i].getAttribute('data-name')

        var input = document.getElementsByName(name)[0]
        // var input = boxes[i].parentNode.children[3]
        textBox.innerHTML = input.value
    }
}

function shiftPoint(field, inc) {
    var valText = field.parentNode.children[1]
    var input = field.parentNode.parentNode.children[0]
    var val = 0

    if(parseInt(valText.innerHTML) == 0) {
        val = 0
        input.value = 0
    }
    
    var oldVal = parseInt(input.value)

    if(inc) {
        val = oldVal + 1
    } else {
        val = oldVal - 1
    }

    input.value = val
    valText.innerHTML = val
}

function setPoint(field) {
    var valText = field.parentNode.children[1]
    var input = field.parentNode.parentNode.children[0]

    if(isNaN(valText.innerHTML)) {
        valText.innerHTML = ''
        input.value = null
    } else {
        input.value = parseInt(valText.innerHTML)
    }
}

function togglePromt(url, msg, sub) {
    var promt = document.getElementById('promt')
    var text = document.getElementById('promtText')

    text.children[0].innerHTML = msg
    if(sub) {
        text.children[1].style.display = 'block'
        text.children[1].children[0].innerHTML = sub
    } else {
        text.children[1].style.display = 'none'
    }

    promt.action = url
    
    promt.classList.add('show')
}

function closePromt() {
    var promt = document.getElementById('promt')
    var text = document.getElementById('promtText')

    text.children[0].innerHTML = ''
    text.children[1].style.display = 'none'
    text.children[1].children[0].innerHTML = ''

    promt.action = ''

    promt.classList.remove('show')
}

function closePanel(but) {
    var mainPanel = but.parentNode
    if(mainPanel.classList.contains('closed')) {
        mainPanel.classList.remove('closed')
    } else {
        mainPanel.classList.add('closed')
    }
}

// Checks forms for errors
function checkForErrors(exmpt, col) {
    return new Promise(async resolve => {
        
        var errors = []

        var name = document.getElementById('name')
        var nameEmail = document.getElementById('nameEmail')
        var location = document.getElementById('location')
        var date = document.getElementById('date')
        var userName = document.getElementById('userName')
        var email = document.getElementById('email')
        var selects = document.getElementsByClassName('formSelInput')
        var details = document.getElementById('details')
        var files = document.getElementsByClassName('file')
        var terms = document.getElementById('terms')
        var password = document.getElementById('inputPass')
        var pass1 = document.getElementById('pass1')
        var bio = document.getElementById('bio')
        errors = []
        
        // Checks if items exist, then if they have content, then if they are required, then checks for potential format errors.
        
        if(name) {
            name.classList.remove('error')
            if(name.value.length < 1) {
                if(name.getAttribute('data-req') == 'true') {
                    name.classList.add('error')
                    errors.push('Name required')
                }
            } else {
                if(name.value.length < 3) {
                    name.classList.add('error')
                    errors.push('Name must be at least three characters')
                } else {
                    if(exmpt) {
                        if(exmpt.field.includes('name')) {
                            var taken = await compDB('dndgroup', col, 'name', name.value, exmpt.id)
                            if(taken) {
                                name.classList.add('error')
                                errors.push('Name already in use')
                            }
                        } else {
                            var taken = await compDB('dndgroup', col, 'name', name.value)
                            if(taken) {
                                name.classList.add('error')
                                errors.push('Usename already in use')
                            }
                        }
                    } else {
                        var taken = await compDB('dndgroup', col, 'name', name.value)
                        if(taken) {
                            name.classList.add('error')
                            errors.push('Usename already in use')
                        }
                    }
                }
            }
        }

        if(nameEmail) {
            nameEmail.classList.remove('error')
            if(nameEmail.value.length < 1) {
                if(nameEmail.getAttribute('data-req') == 'true') {
                    nameEmail.classList.add('error')
                    errors.push('Username or Email required')
                }
            }
        }
        
        if(location) {
            location.classList.remove('error')
            if(location.value.length < 1) {
                if(location.getAttribute('data-req') == 'true') {
                    location.classList.add('error')
                    errors.push('Location required')
                }
            } else {
                if(location.value.length < 3) {
                    location.classList.add('error')
                    errors.push('Location must be at least three characters')
                }
            }
        }
        if(date) {
            date.classList.remove('error')
            if(date.value.length < 1) {
                if(date.getAttribute('data-req') == 'true') {
                    date.classList.add('error')
                    errors.push('Date required')
                }
            }
        }
        if(userName) {
            userName.classList.remove('error')
            if(userName.getAttribute('data-req') == 'true') {
                if(userName.value.length < 1) {
                    userName.classList.add('error')
                    errors.push('Username required')
                } else {
                    if(userName.value.length < 3) {
                        userName.classList.add('error')
                        errors.push('Username must be at least three characters')
                    } else {
                        if(exmpt) {
                            if(exmpt.field.includes('userName')) {
                                var taken = await compDB('dndgroup', col, 'userName', userName.value, exmpt.id)
                                if(taken) {
                                    userName.classList.add('error')
                                    errors.push('Usename already in use')
                                }
                            } else {
                                var taken = await compDB('dndgroup', col, 'userName', userName.value)
                                if(taken) {
                                    userName.classList.add('error')
                                    errors.push('Usename already in use')
                                }
                            }
                        } else {
                            var taken = await compDB('dndgroup', col, 'userName', userName.value)
                            if(taken) {
                                userName.classList.add('error')
                                errors.push('Usename already in use')
                            }
                        }
                        
                    }
                }
            }
        }
        if(email) {
            email.classList.remove('error')
            if(email.getAttribute('data-req') == 'true') {
                if(email.value.length < 1) {
                    email.classList.add('error')
                    errors.push('Email required')
                } else {
                    
                    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if(!re.test(String(email.value).toLowerCase())) {
                        email.classList.add('error')
                        errors.push('Email address invalid')
                    } else {
                        if(exmpt) {
                            if(exmpt.field.includes('email')) {
                                var taken = await compDB('dndgroup', col, 'email', email.value, exmpt.id)
                                if(taken) {
                                    userName.classList.add('error')
                                    errors.push('Email already in use')
                                }
                            } else {
                                var taken = await compDB('dndgroup', col, 'email', email.value)
                                if(taken) {
                                    email.classList.add('error')
                                    errors.push('Email already in use')
                                }
                            }
                        } else {
                            var taken = await compDB('dndgroup', col, 'email', email.value)
                            if(taken) {
                                email.classList.add('error')
                                errors.push('Email already in use')
                            }
                        }
                    }
                }
            }
        }
        if(selects.length > 0) {
            for(var i = 0; i < selects.length; i++) {
                sel = selects[i]
                sel.classList.remove('error')
                if(sel.getAttribute('data-req') == 'true') {
                    if(sel.value == '--- Select Option ---') {
                        sel.classList.add('error')
                        errors.push('Please select a ' + sel.id + '.')
                    }
                }
            }
        }
        
        if(details) {
            var editor = document.getElementById('editor-container')
            editor.classList.remove('error')
            editor.previousSibling.classList.remove('error')

            if(details.value.length < 12) {
                if(details.getAttribute('data-req') == 'true') {
                    editor.classList.add('error')
                    editor.previousSibling.classList.add('error')
                    errors.push('Main body cannot be empty.')
                }
            }
        }
        
        if(files.length > 0) {
            for(var i = 0; i < files.length; i++) {
                var file = files[i]
                var fileCont = file.parentNode.children[1]
                fileCont.classList.remove('error')
                if(file.files.length > 1) {
                    var totalSize = 0
                    for(var j =0; j < file.files.length; j ++) {
                        thisFile = file.files[j]
                        totalSize = totalSize + thisFile.size
                        if(totalSize > 25 * 1024 * 1024) {
                            fileCont.classList.add('error')
                            errors.push('File size(s) too large. A total of 25mb is allowed.')
                            break
                        }
                    }
                } else {
                    if(file.files.length > 0) {
                        if(file.files[0].size > 3000000) {
                            fileCont.classList.add('error')
                            errors.push('Filesize cannot excede 3mb')
                        } else {
                            if(file.getAttribute('data-type') == 'image') {
                                if(file.files[0].type != 'image/jpg' && file.files[0].type != 'image/jpeg' && file.files[0].type != 'image/png' && file.files[0].type != 'image/gif') {
                                    fileCont.classList.add('error')
                                    errors.push('File must be a JPEG, PNG or GIF')
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if(terms) {
            terms.classList.remove('error')
            if(!terms.checked) {
                if(terms.getAttribute('data-req') == 'true') {
                    terms.classList.add('error')
                    errors.push('You must read and agree to the Terms of Service.')
                }
            }
        }
        
        if(password) {
            password.classList.remove('error')
            if(password.value.length < 1) {
                if(password.getAttribute('data-req') == 'true') {
                    password.classList.add('error')
                    errors.push('Please enter a password.')
                }
            }
        }
        
        if(pass1) {
            var mainPass = document.getElementById('password')
            pass1.classList.remove('error')
            mainPass.classList.remove('error')
            if(pass1.value.length < 6) {
                pass1.classList.add('error')
                mainPass.classList.add('error')
                errors.push('Password must be at least six characters')
            } else {
                if(pass1.value != mainPass.value) {
                    pass1.classList.add('error')
                    mainPass.classList.add('error')
                    errors.push('Passwords do not match')
                }
            }
        }

        if(bio) {
            bio.classList.remove('error')
            if(bio.value.length < 1) {
                if(bio.getAttribute('data-req') == 'true') {
                    bio.classList.add('error')
                    errors.push('Bio required')
                }
            } else {
                if(bio.value.length < 10) {
                    bio.classList.add('error')
                    errors.push('Bio must be at least ten characters')
                } else {
                    if(bio.value.length > 110) {
                        bio.classList.add('error')
                        errors.push('Bio cannot be greater than 110 characters')
                    }
                }
            }
        }
        
        if(errors.length > 0) {
            resolve(errors)
        } else {
            resolve(null)
        }

        // if(errors.length > 0) {
        //     formMessage.classList.add('error')
        //     formMessage.children[0].innerHTML = 'Oops...'
        //     for(var i = 0; i< errors.length; i ++) {
        //         err = errors[i]
        //         var li = document.createElement('LI')
        //         li.innerHTML = err
        //         formMessage.children[1].appendChild(li)
        //     }
        //     window.scrollTo(0, 0);
        //     return false
        // } else {
        //     return true
        // }
    })
    
    
}