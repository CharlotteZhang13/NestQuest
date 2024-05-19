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
var verticalDiv = document.getElementById("verticalmoves")
var horizontalDiv = document.getElementById("horizontalmoves")


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
        val_03: 0
    };

    if (item.classList.contains("while")) {
        func.name = "while";
    } else if (item.classList.contains("for")) {
        func.name = "for";
        editable = item.querySelector(".editable");
        func.val_01 = parseFloat(editable.textContent);
    } else if (item.classList.contains("add")) {
        func.name = "add";
        editable = item.querySelector(".editable");
        func.val_01 = parseFloat(editable.textContent);
    } else if (item.classList.contains("wait")) {
        func.name = "wait";
        editable = item.querySelector(".editable");
        func.val_01 = parseFloat(editable.textContent);
    } else if (item.classList.contains("if")) {
        func.name = "if";
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

    return func;
}

function tokenize(target) {

    let items = target.children;
    for (let item of items) {
        if (item.classList.contains("placeholder")) break;
        var func = readTokens(item);
        if (func.name != null) funcTokens.push(func);
        if (item.tagName == "UL") {
            tokenize(item);
        }
    }
    var func = {
        name: "end",
        val_01: 0,
        val_02: 0
    };
    funcTokens.push(func);
}

function func_combiner(fn) {
    return function () {
        if (forcestop == true) {
            forcestop = false;
            var highestTimeoutId = setTimeout(";");
            for (var i = 0; i < highestTimeoutId; i++) {
                clearTimeout(i);
            }
            return;
        }
        fn.apply(this, arguments);
    }
}

function func_add(incre) {
    displayNum += incre;
    displayDiv.innerText = displayNum;
}

function func_wait(time) {
    timeout += time;
}

function func_loop(t1, t2, rmn) {

    if (rmn == 0) {
        return;
    }

    while (t_idx < t2) {
        runTokens();
    }

    t_idx = t1
    if (rmn == -1) {
        func_combiner(func_loop)(t1, t2, -1);
    } else {
        func_combiner(func_loop)(t1, t2, rmn - 1);
    }
}

function func_while() {
    var t1, t2;
    t1 = t_idx;
    while (true) {
        if (runTokens() == 0) {
            t2 = t_idx - 1;
            break;
        }
    }
    t_idx = t1;

    func_combiner(func_loop)(t1, t2, -1);

    t_idx = t2 + 1;
}

function func_for(n) {
    if (n == 0) {
        while (funcTokens[t_idx].name != "end") {
            t_idx++;
        };
        t_idx++;
    } else {
        var t1, t2;
        t1 = t_idx;
        while (true) {
            if (runTokens() == 0) {
                t2 = t_idx - 1;
                n--;
                break;
            }
        }
        t_idx = t1;

        func_combiner(func_loop)(t1, t2, n);
        t_idx = t2 + 1;
    }
}

function read_bool(n1, n2, s) {
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

function func_if(n1, n2, s) {
    if (typeof n1 == "object") {
        n1 = varList[n1.idx].val;
    }
    if (typeof n2 == "object") {
        n2 = varList[n2.idx].val;
    }

    if (read_bool(n1, n2, s)) {
        func_for(1);
    } else {
        func_for(0);
    }
}

function func_vertical_move(n) {
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

function func_horizontal_move(n) {
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


function runTokens() {

    var token = funcTokens[t_idx];
    t_idx++;
    timeout += 4;
    displayDiv.innerText = displayNum;

    if (token.name == "while") {
        func_combiner(func_while)();
    } else if (token.name == "for") {
        func_combiner(func_for)(token.val_01);
    } else if (token.name == "end") {
        return 0;
    } else if (token.name == "add") {
        setTimeout(() => {
            func_combiner(func_add)(token.val_01);
        }, timeout);
    } else if (token.name == "wait") {
        func_combiner(func_wait)(token.val_01);
    } else if (token.name == "if") {
        func_combiner(func_if)(token.val_01, token.val_03, token.val_02);
    } else if (token.name == "MoveVertical") {
        setTimeout(() => {
            func_combiner(func_vertical_move)(token.val_01);
        }, timeout);
    } else if (token.name == "MoveHorizontal") {
        setTimeout(() => {
            func_combiner(func_horizontal_move)(token.val_01);
        }, timeout);
    }

    return 1;
}

runButton.addEventListener("click", function () {
    funcTokens = [];
    varList = [];
    t_idx = 0;
    timeout = 0;
    displayNum = 0;
    mVertical = 0;
    verticalDiv.innerText = "";
    mHorizontal = 0;
    horizontalDiv.innerText = "";
    forcestop = false;

    readVar();
    tokenize(mainSlist);
    while (t_idx < funcTokens.length) {
        runTokens();
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
        forcestop = true;
    }

});
