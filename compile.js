var funcTokens = [];
var varList = [];
var t_idx = 0;
var timeout = 0;
var displayNum = 0;
var runButton = document.getElementById("run");
var stopButton = document.getElementById("stop");
var displayDiv = document.getElementById("display");
var forcestop = false;

var mVertical = 0;
var mHorizontal = 0;
var tokenIdx = 0;
var verticalDiv = document.getElementById("verticalmoves")
var horizontalDiv = document.getElementById("horizontalmoves")
var sayDiv = document.getElementById("talks")

returnVal = {
    END: 0,
    REGULAR: 1,
    BREAK: 2
}

function readVar() {
    varAll = document.querySelectorAll(".var_horizontal");
    idx = 0;
    varAll.forEach(v => {
        var vstruct = {
            name: null,
            val: 0,
            idx: 0,
        };

        vstruct.name = v.querySelector(".name").textContent;
        vstruct.val = parseFloat(v.querySelector(".editable").textContent);
        vstruct.idx = idx++;
        varList.push(vstruct);
    });
}

function readTokens(item) {

    var func = {
        name: null,
        val_01: 0,
        val_02: 0,
        val_03: 0,
        val_04: '',
        idx: 0
    };

    if (item.classList.contains("for")) {
        func.name = "for";
        editable = item.querySelector(".editable");
        func.val_01 = parseFloat(editable.textContent);
    } else if (item.classList.contains("break")) {
        func.name = "break";
    } else if (item.classList.contains("add")) {
        func.name = "add";
        editable = item.querySelector(".editable");
        func.val_01 = parseFloat(editable.textContent);
    } else if (item.classList.contains("plus_add")) {
        func.name = "plus_add";
        first = item.querySelector(".horizontal").children[0];
        var x = first.querySelector(".name").textContent;
        func.val_01 = varList[x - '0'];
        sign = item.querySelector(".sign");
        func.val_02 = sign.textContent;
        second = item.querySelector(".dropdown").nextElementSibling;
        if (second.classList.contains("editable")) {
            func.val_03 = parseFloat(second.textContent);
        } else {
            func.val_03 = varList[parseInt(second.querySelector(".name").textContent)];
        }
    } else if (item.classList.contains("wait")) {
        func.name = "wait";
        editable = item.querySelector(".editable");
        func.val_01 = parseFloat(editable.textContent);
    } else if (item.classList.contains("if") || item.classList.contains("while")) {
        func.name = item.classList.contains("if")? "if" : "while";
        sign = item.querySelector(".sign");
        if (sign == null) {
            func.val_01 = 1;
            func.val_02 = "==";
            func.val_03 = 1;
        } else {
            first = item.querySelector(".bool").children[0];
            func.val_02 = sign.textContent;
            second = item.querySelector(".dropdown").nextElementSibling;
            if (first.classList.contains("editable")) {
                func.val_01 = parseFloat(first.textContent);
            } else {
                var x = first.querySelector(".name").textContent;
                func.val_01 = varList[x - '0'];
            }
            if (second.classList.contains("editable")) {
                func.val_03 = parseFloat(second.textContent);
            } else {
                func.val_03 = varList[parseInt(second.querySelector(".name").textContent)];
            }
        }
    }
    else if (item.classList.contains("MoveVertical")) {
        func.name = "MoveVertical";
        editable = item.querySelector(".editable");
        func.val_01 = parseFloat(editable.textContent);
    }
    else if (item.classList.contains("MoveHorizontal")) {
        func.name = "MoveHorizontal";
        editable = item.querySelector(".editable");
        func.val_01 = parseFloat(editable.textContent);
    }
    else if (item.classList.contains("Say")) {
        func.name = "Say";
        editable = item.querySelector(".editable");
        func.val_04 = editable.textContent;
    }

    return func;
}

function tokenize(target) {

    let items = target.children;
    let currentIdx = tokenIdx;
    for (let item of items) {
        if (item.classList.contains("placeholder")) break;
        var func = readTokens(item);
        if (item.tagName == "UL") func.idx = ++tokenIdx;
        if (func.name != null) funcTokens.push(func);
        if (item.tagName == "UL") tokenize(item);
    }
    var f = {
        name: "end",
        val_01: 0,
        val_02: 0,
        idx: currentIdx
    };
    funcTokens.push(f);
}

function func_combiner(fn) {
    return async function () {
        if (forcestop == true) {
            forcestop = false;
            var highestTimeoutId = setTimeout(";");
            for (var i = 0; i < highestTimeoutId; i++) {
                clearTimeout(i);
            }
            return;
        }
        return await fn.apply(this, arguments);
    }
}

async function func_add(incre) {
    displayNum += incre;
    displayDiv.innerText = displayNum;
}

async function func_plus_add(n1, n2, sign) {
    if (typeof n2 == "object") {
        n2 = varList[n2.idx].val;
    }
    switch (sign) {
        case "+=":
            varList[n1.idx].val += n2;
            break;
        case "-=":
            varList[n1.idx].val -= n2;
            break;
        case "*=":
            varList[n1.idx].val *= n2;
            break;
        case "/=":
            varList[n1.idx].val /= n2;
            break;
    }
}

async function func_wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    })
}

async function func_while(n1, n2, s, id) {
    var t1, t2;
    var bk = false;
    t1 = t_idx;

    while (funcTokens[t_idx].name != "end" || funcTokens[t_idx].idx != id) {
        t_idx++;
    };
    t2 = t_idx;

    while (read_bool(n1, n2, s)) {
        if (bk) break;
        t_idx = t1
        while (t_idx < t2) {
            var a = await runTokens();
            if (a == returnVal.BREAK) {
                bk = true;
                break;
            }
        }
    }

    t_idx = t2 + 1;
}

async function func_for(n, id) {
    var t1, t2;
    var bk = false;
    t1 = t_idx;

    while (funcTokens[t_idx].name != "end" && funcTokens[t_idx].idx != id) {
        t_idx++;
    };
    t2 = t_idx;

    for (var i = 0; i < n; i++) {
        if (bk) break;
        t_idx = t1
        while (t_idx < t2) {
            if (await runTokens() == returnVal.BREAK) {
                bk = true;
                break;
            }
        }
    }

    t_idx = t2 + 1;
}

function read_bool(n1, n2, s) {
    if (typeof n1 == "object") {
        n1 = varList[n1.idx].val;
    }
    if (typeof n2 == "object") {
        n2 = varList[n2.idx].val;
    }

    if (s == "==") {
        return n1 == n2;
    } else if (s == ">") {
        return n1 > n2;
    } else if (s == "<") {
        return n1 < n2;
    } else {
        return true;
    }
}

async function func_if(n1, n2, s, id) {

    var t1, t2;
    t1 = t_idx;
    while (funcTokens[t_idx].name != "end" && funcTokens[t_idx].idx != id) {
        t_idx++;
    };
    t2 = t_idx;

    if (read_bool(n1, n2, s)) {
        t_idx = t1
        while (t_idx < t2) {
            if (await runTokens() == returnVal.BREAK) {
                t_idx = t2 + 1;
                return returnVal.BREAK;
            }
        }
    }

    t_idx = t2 + 1;
    return returnVal.REGULAR;
}

async function func_vertical_move(n) {
    mVertical += n;
    text = "";
    temp = mVertical;
    while (temp > 0) {
        text += "\n";
        temp--;
    }
    verticalDiv.innerText = text;
}
//func_vertical_move(5)

async function func_horizontal_move(n) {
    mHorizontal += n;
    text = "";
    temp = mHorizontal;
    while (temp > 0) {
        text += "aa";
        temp -= 1;
    }
    horizontalDiv.innerText = text;
    horizontalDiv.style.color = "#f5f5f5";
}
//func_horizontal_move(5)

async function func_say(str) {
    //await func_combiner(func_wait)(50);
    sayDiv.innerText = str;
}
//func_say("hihihihihihihihi");

async function runTokens() {

    var token = funcTokens[t_idx];
    t_idx++;
    displayDiv.innerText = displayNum;

    if (token.name == "while") {
        await func_combiner(func_while)(token.val_01, token.val_03, token.val_02, token.idx);
    } else if (token.name == "for") {
        await func_combiner(func_for)(token.val_01, token.idx);
    } else if (token.name == "break") {
        return returnVal.BREAK;
    } else if (token.name == "end") {
        return returnVal.END;
    } else if (token.name == "add") {
        await func_combiner(func_add)(token.val_01);
    } else if (token.name == "plus_add") {
        await func_combiner(func_plus_add)(token.val_01, token.val_03, token.val_02);
    } else if (token.name == "wait") {
        await func_combiner(func_wait)(token.val_01);
    } else if (token.name == "if") {
        return await func_combiner(func_if)(token.val_01, token.val_03, token.val_02, token.idx);
    } else if (token.name == "MoveVertical") {
        await func_combiner(func_vertical_move)(token.val_01);
    } else if (token.name == "MoveHorizontal") {
        await func_combiner(func_horizontal_move)(token.val_01);
    } else if (token.name == "Say") {
        await func_combiner(func_say)(token.val_04);
    }
    await func_combiner(func_wait)(300);

    return returnVal.REGULAR;
}

runButton.addEventListener("click", async function () {
    funcTokens = [];
    varList = [];
    t_idx = 0;
    timeout = 0;
    displayNum = 0;
    mVertical = 0;
    verticalDiv.innerText = "";
    mHorizontal = 0;
    horizontalDiv.innerText = "";
    sayDiv.innerText = "...";
    forcestop = false;

    readVar();
    tokenize(mainSlist);
    while (t_idx < funcTokens.length) {
        await runTokens();
    }
});

stopButton.addEventListener("click", function () {
    if (funcTokens.length != 0) {
        funcTokens = [];
        varList = [];
        t_idx = 0;
        timeout = 0;
        displayNum = 0;
        displayDiv.innerText = displayNum;
        mVertical = 0;
        verticalDiv.innerText = "";
        mHorizontal = 0;
        horizontalDiv.innerText = "";
        sayDiv.innerText = "...";
        forcestop = true;
    }

});
