var elevators = [
    {
        DOM: $(".elevator-1"),
        busy: false,
        dir: "up",
        floor: 0,
        doors: {
            left: $("#left-door-1"),
            right: $("#right-door-1")
        },
        missions: [],
        closed: true
    },
    {
        DOM: $(".elevator-2"),
        busy: false,
        dir: "up",
        floor: 0,
        doors: {
            left: $("#left-door-2"),
            right: $("#right-door-2")
        },
        missions: [],
        closed: true
    },
    {
        DOM: $(".elevator-3"),
        busy: false,
        dir: "up",
        floor: 0,
        doors: {
            left: $("#left-door-3"),
            right: $("#right-door-3")
        },
        missions: [],
        closed: true
    }
];

var floors = [
    true,
    false,
    false,
    false
];

var elGaps = [];

// function checkElevInFloor(btn, num) {
//     // var f = 0;
//     // for (let x = 0; x < 3; x++) {
//     //     if (elevators[x].floor == num && elevators[x].busy == false) {
//     //         send(btn, num, x, 0);

//     //         break;
//     //     } else {
//     //         f++
//     //     }
//     // }
//     // if (f == 3) {
//         searchCloseElevator(btn, num);
//     // }   
// }

function init(btn, num) {
    btn.disabled = true;
    $(btn).css("backgroundColor", "red");
    searchCloseElevator(btn, num);
    checkIfAvailable(btn, num)
}

function searchCloseElevator(btn, num) {
    elGaps = []
    $(elevators).each((i, el)=> {
        var gap = calcGap(i, num)
        var elGap = {
            elevNum: i,
            gap: gap,
            busy: elevators[i].busy,
            dir: elevators[i].dir
            };
        elGaps.push(elGap) 
    })
    sortElGaps(btn, num) 
}

function calcGap(i, num) {
    var gap = num - elevators[i].floor;
    if (gap < 0) {
        gap *= -1;
    }
    return gap;
}

function sortElGaps(btn, num) {
    elGaps.sort((a, b)=> {
        return a.gap - b.gap;

    })
}

function checkIfAvailable(btn, num) {
    let g = 0;
    for (let z = 0; z < 3; z++) {
        if (elGaps[z].busy == false) {
            send(btn, num, elGaps[z].elevNum);
            break;
        } else {
            g++
        }
    }
    if (g == 3) {
        constructMission(btn, num, chekDirection(btn, num))
    } 
}

function chekDirection(btn, num) {
    searchCloseElevator(btn, num);
    let g = 0;
    for (let z = 0; z < 3; z++) {
        if (elGaps[z].dir == btn.id || elGaps[z].dir == "") {
            return elGaps[z].elevNum;
        } else {
            g++
        }
    }
    if (g == 3) {
        return elGaps[0].elevNum;
    }
}

function constructMission(btn, num, i) {
    var mission = {
        elev: i,
        gap: elGaps[i].gap,
        btn: btn,
        floor: num
    }
    console.log(mission)
    elevators[i].missions.push(mission);
}

function extractMission(i) {
    if (elevators[i].missions.length > 0) {
        let btn = elevators[i].missions[0].btn;
        let num = elevators[i].missions[0].floor;
        let elev = elevators[i].missions[0].elev;
        elevators[i].missions.shift();
        send(btn, num, elev);
    } else {
        elevators[i].dir = "";
    }
}

function send(btn, num, elev) {
    elevators[elev].busy = true;
    elevators[elev].dir = btn.id;
    console.log(elevators[elev].dir)
    let gap = calcGap(elev, num);
    $(btn).css("backgroundColor", "red");
    $(`.elevator-${elev + 1}`).delay(500).animate({bottom: num * 180}, 2000 * gap, "linear", function(){
        $(btn).css("backgroundColor", "yellow");
        btn.disabled = false;
        elevators[elev].floor = num;
        openDoors(elev);
    });
}

function openDoors(elev) {
    elevators[elev].closed = false;
    $(elevators[elev].doors.left).delay(500).animate({left: "-48%"}, 1500);
    $(elevators[elev].doors.right).delay(500).animate({right: "-48%"}, 1500);
    closeDoors(elev, 2100);
}

function closeDoors(elev, delay, a, btn, num) {
    $(elevators[elev].doors.left).delay(delay).animate({left: "0"}, delay / 1.5);
    $(elevators[elev].doors.right).delay(delay).animate({right: "0"}, delay / 1.5, function() {
        elevators[elev].closed = true;
        elevators[elev].busy = false;
        extractMission(elev)
    });
}