var funcTokens = [];
var t_idx = 0;
var timeout = 0;
var displayNum = 0;
var runButton = document.getElementById("run");
var stopButton = document.getElementById("stop");
var displayDiv = document.getElementById("display");
var forcestop = false;

function readTokens(item) {
    var func = {
        name: null,
        val_01: 0,
        val_02: 0
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
    }

    return func;
}

function tokenize(target) {

    let items = target.children;
    for (let item of items) {
        if (item.classList.contains("placeholder")) break;
        var func = readTokens(item);
        funcTokens.push(func);
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
    console.log(timeout);
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

function runTokens() {

    var token = funcTokens[t_idx];
    t_idx++;
    timeout += 4;

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
    }

    return 1;
}

runButton.addEventListener("click", function () {
    tokenize(mainSlist);
    while (t_idx < funcTokens.length) {
        runTokens();
    }
});

stopButton.addEventListener("click", function () {
    if (funcTokens.length != 0) {
        funcTokens = [];
        t_idx = 0;
        timeout = 0;
        displayNum = 0;
        forcestop = true;
    }

});
