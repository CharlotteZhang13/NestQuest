let slistAll = document.querySelectorAll(".slist"),
    mainSlist = document.getElementById("main"),
    trashDiv = document.getElementById("trash"),
    dropdownAll = document.querySelectorAll(".dropdown"),
    editable = document.querySelectorAll(".editable");

let currentItem = null,
    currentSlist = null,
    dragCounter = 0,
    previousEditable = null;

//element的子元素忽略鼠标enter事件，注意要给html里打上ignore标签
function setIgnore(tr, s) {
    var ignoreAll = document.querySelectorAll(s)
    ignoreAll.forEach(ig => {
        if (tr && !ig.contains(currentItem)) {
            ig.style.pointerEvents = 'none';
        } else {
            ig.style.pointerEvents = 'auto';
        }
    })
}

//给所有下拉列表元素设置样式
function setDropdowns() {
    dropdownAll = document.querySelectorAll(".dropdown");
    dropdownAll.forEach(dropd => {
        dropaAll = dropd.querySelectorAll(".item");
        dropaAll.forEach(dropa => {
            dropa.addEventListener("click", function () {
                dropbtn = dropd.querySelector(".dropbtn");
                dropbtn.textContent = dropa.textContent;
            });
        });
    });
}

//给列表元素添加placeholder，这样可以往placeholder上拖元素
function setSlistPlaceholders(target) {
    if (target.id == "menu" || target.id == "trash" || target.id == "var_menu") return;
    var placeHolder = document.createElement("li");
    placeHolder.textContent = "Add code blocks to above...";
    placeHolder.classList.add("element");
    placeHolder.classList.add("placeholder");
    target.appendChild(placeHolder);
}

function setEditable() {
    editable = document.querySelectorAll(".editable");

    for (let i of editable) {

        mainSlist = document.getElementById("main");
        if (!mainSlist.contains(i)) continue;

        i.ondragenter = e => {
            if (i != currentItem && !currentItem.contains(i)) {
                i.classList.add("active");
                e.stopPropagation();
            }
        }

        i.ondragleave = e => {
            if (i != currentItem && !currentItem.contains(i)) {
                i.classList.remove("active");
                e.stopPropagation();
            }
        }

        i.ondragover = e => e.preventDefault();

        i.ondrop = e => {
            e.preventDefault();

            if (i != currentItem && !currentItem.contains(i)) {

                sibling = currentItem.nextSibling;
                while (sibling && sibling.nodeType !== 1) { 
                    sibling = sibling.nextSibling;
                }
                if(sibling != null && sibling.classList.contains("editable")){
                    previousEditable = sibling;
                } else {
                    previousEditable = null;
                }

                if (previousEditable != null) previousEditable.style.display = "block";
                i.style.display = "none";

                if (mainSlist.contains(currentItem)) {
                    i.parentNode.insertBefore(currentItem, i);
                } else {
                    var cloned = currentItem.cloneNode(true);
                    i.parentNode.insertBefore(cloned, i);
                }


                slistAll.forEach(slist => {
                    setSlistTriggers(slist);
                })
                setDropdowns();
                setIgnore(false, ".ignore");
                setEditable();

                socket.emit("updateCode", {
                    newCode: document.getElementById("main").outerHTML,
                    roomUniqueId: roomUniqueId
                });
            }

            e.stopPropagation()
        }
    }
}

//垃圾桶拖拽事件
function setTrashTriggers(target) {
    target.ondragenter = e => {
        target.classList.add("active");
        e.stopPropagation();
    }

    target.ondragleave = e => {
        target.classList.remove("active");
        e.stopPropagation();
    }

    target.ondragover = e => e.preventDefault();

    target.ondrop = e => {
        e.preventDefault();

        if (currentItem.classList.contains("bool")) {
            sibling = currentItem.nextSibling;
            while (sibling && sibling.nodeType !== 1) { 
                sibling = sibling.nextSibling;
            }
            if(sibling != null && sibling.classList.contains("editable")){
                previousEditable = sibling;
            } else {
                previousEditable = null;
            }

            if (previousEditable != null) previousEditable.style.display = "block";
        }

        target.classList.remove("active");
        mainSlist = document.getElementById("main")
        if (mainSlist.contains(currentItem)) {
            currentItem.parentNode.removeChild(currentItem);
        }

        slistAll = document.querySelectorAll(".slist")
        slistAll.forEach(slist => {
            setSlistTriggers(slist);
        })

        socket.emit("updateCode", {
            newCode: document.getElementById("main").outerHTML,
            roomUniqueId: roomUniqueId
        });

        e.stopPropagation();
    }
}

function setSlistTriggers(target) {

    let items = target.querySelectorAll(".element");
    slistAll = document.querySelectorAll(".slist");
    mainSlist = document.getElementById("main");

    for (let i of items) {
        if (!i.classList.contains("placeholder")) i.draggable = true; //所有placeholder都不能拖拽

        i.ondragstart = e => {
            if (!i.classList.contains("placeholder")) {
                currentItem = i;
                currentSlist = i.parentNode;

                slistAll.forEach(slist => {
                    //能往里面拖当前元素的地方都hint出来
                    if (i.classList.contains("bool")) {
                        let query = slist.querySelectorAll(".editable");
                        for (let it of query) {
                            if (it != currentItem && !currentItem.contains(it) && mainSlist.contains(it)) { it.classList.add("hint"); }
                        }
                    } else {
                        let query = slist.querySelectorAll(".element");
                        for (let it of query) {
                            if (it != currentItem && !currentItem.contains(it) && mainSlist.contains(it)) { it.classList.add("hint"); }
                        }
                        setIgnore(true, ".editable");
                    }
                })

                setIgnore(true, ".ignore"); //无视element子元素的点击事件，防止拖拽检测出问题
            }
            e.stopPropagation();
        };

        i.ondragenter = e => {
            if (!currentItem.classList.contains("bool")) {
                //进入某个可以放置的位置就标红出来
                if (i != currentItem && !currentItem.contains(i) && mainSlist.contains(i)) { i.classList.add("active"); }
            }
            e.stopPropagation();
        };

        i.ondragleave = e => {
            if (!currentItem.classList.contains("bool")) {
                //离开某个可以放置的位置就去除标红
                i.classList.remove("active");
            }
            e.stopPropagation();
        }

        i.ondragend = e => {
            if (currentItem.classList.contains("bool")) {
                editable = document.querySelectorAll(".editable");
                editable.forEach(ed => {
                    ed.classList.remove("hint");
                    ed.classList.remove("active");
                })
            } else {
                //拖拽结束就去除所有的hint和标红
                slistAll.forEach(slist => {
                    let query = slist.querySelectorAll(".element");
                    for (let it of query) {
                        it.classList.remove("hint");
                        it.classList.remove("active");
                    }
                })
            }
            trashDiv.classList.remove("active");

            socket.emit("updateCode", {
                newCode: document.getElementById("main").outerHTML,
                roomUniqueId: roomUniqueId
            });
            e.stopPropagation();
        };

        i.ondragover = e => e.preventDefault();

        i.ondrop = e => {
            e.preventDefault();
            if (!currentItem.classList.contains("bool")) {
                //插入元素
                if (i != currentItem && !currentItem.contains(i) && mainSlist.contains(i)) {
                    if (mainSlist.contains(currentItem)) {
                        i.parentNode.insertBefore(currentItem, i);
                    } else {
                        var cloned = currentItem.cloneNode(true);
                        i.parentNode.insertBefore(cloned, i);
                    }
                }

                //新复制出来的slist也都要设置一遍
                slistAll.forEach(slist => {
                    setSlistTriggers(slist);
                })
                setDropdowns(); //复制出来的下拉列表元素也都要设置一遍
                setIgnore(false, ".ignore"); //恢复element子元素的点击事件
                setIgnore(false, ".editable");
                setEditable();
            }

            socket.emit("updateCode", {
                newCode: document.getElementById("main").outerHTML,
                roomUniqueId: roomUniqueId
            });
            e.stopPropagation()
        };
    }
}

function addVar(){
    var addVarBtn = document.querySelector(".add_var");
    addVarBtn.addEventListener("click", function () {
        var cloned = addVarBtn.previousElementSibling.cloneNode(true);
        var name = cloned.querySelector(".name");
        name.textContent = parseFloat(addVarBtn.previousElementSibling.textContent) + 1;
        addVarBtn.parentNode.appendChild(cloned);
        addVarBtn.parentNode.insertBefore(cloned, addVarBtn);

        setDropdowns();
        slistAll = document.querySelectorAll(".slist")
        slistAll.forEach(slist => {
            setSlistTriggers(slist);
        })

        socket.emit("updateVar", {
            newVar: document.getElementById("var_menu").outerHTML,
            roomUniqueId: roomUniqueId
        });
    });
} 

slistAll.forEach(slist => {
    setSlistPlaceholders(slist);
    setSlistTriggers(slist);
    setDropdowns();
})
setTrashTriggers(trashDiv);
setEditable();
addVar();
