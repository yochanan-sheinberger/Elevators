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
        closed: true,
        dest: 0
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
        closed: true,dest: 0
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
        closed: true,
        dest: 0
    }
];

var elGaps = [];
var openMissions = [];
var engineSound = document.getElementById("enginesound");
var doorSound = document.getElementById("doorsound");

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
            dir: elevators[i].dir,
            };
        elGaps.push(elGap) 
    })
    sortElGaps() 
}

function calcGap(i, num) {
    var gap = num - elevators[i].floor;
    if (gap < 0) {
        gap *= -1;
    }
    return gap;
}

function sortElGaps() {
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
        let elev = chekDirection(btn, num);
        if (elev != null) {
            let mission = constructMission(btn, num, elev)
            elevators[elev].missions.push(mission);
        }
    } 
}

function chekDirection(btn, num) {
    let g = 0;
    for (let z = 0; z < 3; z++) {
        let f = checkDir(btn, num, z)
        if (elGaps[z].dir == btn.id && f == true) {
            return elGaps[z].elevNum;
        } else {
            g++
        }
    }
    if (g == 3) {
        let mission = constructMission(btn, num, elGaps[0].elevNum)
        openMissions.push(mission);
    }
}

function checkDir(btn, num, z) {
    if (btn.id == "up" && num > elevators[z].dest) {
        return true;
    } else if (btn.id == "down" && num < elevators[z].dest) {
        return true;
    } else {
        return false;
    }
}

function constructMission(btn, num, i) {
    let mission = {
        elev: i,
        btn: btn,
        floor: num
    }
    return mission;
}

function extractMission(i) {
    if (elevators[i].missions.length > 0) {
        let btn = elevators[i].missions[0].btn;
        let num = elevators[i].missions[0].floor;
        elevators[i].missions.shift();
        send(btn, num, i);
        console.log(btn, num, i)
    } else if(openMissions.length > 0) {
        btn = openMissions[0].btn;
        num = openMissions[0].floor;
        openMissions.shift();
        send(btn, num, i);
    }
}

function send(btn, num, elev) {
    elevators[elev].busy = true;
    elevators[elev].dir = btn.id;
    console.log(elevators[elev].dir)
    elevators[elev].dest = num;
    let gap = calcGap(elev, num);
    playSound(1);
    $(btn).css("backgroundColor", "red");
    $(`.elevator-${elev + 1}`).delay(500).animate({bottom: num * 180}, 2000 * gap, "linear", function(){
        $(btn).css("backgroundColor", "yellow");
        engineSound.pause();
        btn.disabled = false;
        elevators[elev].floor = num;
        openDoors(elev);
    });
}

function openDoors(elev) {
    playSound(500);
    elevators[elev].closed = false;
    $(elevators[elev].doors.left).delay(500).animate({left: "-48%"}, 1500);
    $(elevators[elev].doors.right).delay(500).animate({right: "-48%"}, 1500);
    closeDoors(elev, 2100);
}

function closeDoors(elev, delay) {
    playSound(4000);
    $(elevators[elev].doors.left).delay(delay).animate({left: "0"}, delay / 1.5);
    $(elevators[elev].doors.right).delay(delay).animate({right: "0"}, delay / 1.5, function() {
        elevators[elev].closed = true;
        elevators[elev].busy = false;
        extractMission(elev)
    });
}

function playSound(a) {
    if (a == 1) {
        setTimeout(()=> {
            engineSound.play();
        }, 500)
    } else {
        setTimeout(()=> {
            doorSound.play();
        }, a)
    }
    
}

function creatInnerMission(btn, num, elev) {
    $(btn).css("backgroundColor", "red");
    btn.disabled = true;
    let mission = constructMission(btn, num, elev);
    if (elevators[elev].missions.length == 0) {
        elevators[elev].missions.push(mission);
    } else if (elevators[elev].dir == "up") {
        if (mission.floor > elevators[elev].floor) {
            mission.btn.id = "up";
            let f = false;
            for (let i = 0; i < elevators[elev].missions.length; i++) {
                if(mission.floor < elevators[elev].missions[i].floor) {
                    elevators[elev].missions.splice(i, 0, mission);
                    f = true;
                    break;
                }
            }
            if (!f) {
                for (let i = 0; i < elevators[elev].missions.length; i++) {
                    if(mission.floor > elevators[elev].missions[i].floor && elevators[elev].missions[i].floor < elevators[elev].floor) {
                        elevators[elev].missions.splice(i, 0, mission);
                        f = true;
                        break;
                    }
                }
            } 
            if (!f) {
                elevators[elev].missions.push(mission);
            }
        } else {
            mission.btn.id = "down";
            console.log("1")
            let z = false;
            for (let n = 0; n < elevators[elev].missions.length; n++) {
                if(mission.floor > elevators[elev].missions[n].floor) {
                    elevators[elev].missions.splice(n, 0, mission);
                    z = true;
                    console.log("2")
                    break;
                }
            }
            if (!z) {
                console.log("3")
                elevators[elev].missions.push(mission);
            }
        }
        
    } else {
        // if (mission.floor < elevators[elev].floor) {
        //     for (let i = 0; i < elevators[elev].missions.length; i++) {
        //         if(mission.floor < elevators[elev].missions[i].floor) {
        //             elevators[elev].missions.splice(i, 0, mission);
        //             break;
        //         } else if (elevators[elev].missions[i].floor > mission.floor) {
        //             elevators[elev].missions.splice(i, 0, mission);
        //             break;
        //         }
        //     }
        // } else {
        //     for (let i = 0; i < elevators[elev].missions.length; i++) {
        //         if(mission.floor > elevators[elev].missions[i].floor) {
        //             elevators[elev].missions.splice(i, 0, mission);
        //             break;
        //         } else {
        //             elevators[elev].missions.push(mission);
        //             break;
        //         }
        //     }
        // }
    }
}
