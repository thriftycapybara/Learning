$(() => {
    let canvas;
    let maze = [];
    const undiscovered = -99;
    const noExit = -1;
    const roomSize = 40;
    const corridorLength = 5;
    let player = {
        roomIx:0
    };
    function resizeCanvas() {
        canvas = document.getElementById('top-canvas');
        canvas.width = window.innerWidth - 5;
        canvas.height = (window.innerHeight / 2)-10;
        var $text = $('#bottom-text');
        $text.width(window.innerWidth - 5)
        $text.height(window.innerHeight / 2);

    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function start(){
        var $text = $('#console');
        $text.empty();
        $text.append("<p>Welcome to Aiden's adventure game.</p>");
        
        maze=[];
        player.roomIx = createRoom(0,0);
        displayRoom();
        waitForInput();
    }
    start();

    function drawMap(roomIx){
        var currentRoom = maze[roomIx];
        var cRoomX = calculatePosition(currentRoom.position.x);
        var cRoomY = calculatePosition(currentRoom.position.y);
        var scX = canvas.width / 2;
        var scY = canvas.height / 2;
        var xT = scX - cRoomX;
        var yT = scY - cRoomY;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.lineWidth = 3
        $.each(maze,function(i,e){
            var cX = calculatePosition(e.position.x) + xT;
            var cY = calculatePosition(e.position.y) + yT;
            var fullSize = calculatePosition(1);
            var halfSize = fullSize / 2;
            if(cX +halfSize>0 && cX - halfSize < canvas.width && cY + halfSize > 0 && cY - halfSize < canvas.height){
                ctx.fillStyle = '#dddddd';
                ctx.fillRect(cX - (roomSize/2), cY - (roomSize/2), roomSize, roomSize );
                if(i == roomIx){
                    ctx.strokeStyle = '#880000';
                } else {
                    ctx.strokeStyle = '#333333';
                }
                ctx.strokeRect(cX - (roomSize/2), cY - (roomSize/2), roomSize, roomSize );
                
                ctx.strokeStyle = '#dddddd';
                if(e.exits[0] != noExit){
                    ctx.beginPath();
                    ctx.moveTo(cX, cY);
                    ctx.lineTo(cX, cY - halfSize);
                    ctx.stroke();
                }
                if(e.exits[1] != noExit){
                    ctx.beginPath();
                    ctx.moveTo(cX, cY);
                    ctx.lineTo(cX + halfSize, cY);
                    ctx.stroke();
                }
                if(e.exits[2] != noExit){
                    ctx.beginPath();
                    ctx.moveTo(cX, cY);
                    ctx.lineTo(cX, cY + halfSize);
                    ctx.stroke();
                }
                if(e.exits[3] != noExit){
                    ctx.beginPath();
                    ctx.moveTo(cX, cY);
                    ctx.lineTo(cX - halfSize, cY);
                    ctx.stroke();
                }
                ctx.font = "16px serif";
                ctx.textAlign = "center";
                ctx.fillStyle="#880000";
                ctx.fillText(i,cX, cY + 6);
            }
        });
    }

    function calculatePosition(dimension){
        return dimension * (roomSize + (corridorLength * 2))
    }

    function playerMove(to, dx, dy, direction) {
        if(to === undiscovered){
            var currentRoom = maze[player.roomIx];
            player.roomIx = createRoom(currentRoom.position.x + dx, currentRoom.position.y + dy, player.roomIx, direction);
            currentRoom.exits[direction] = player.roomIx;
        } else {
            player.roomIx = to;
        }
        
    }

    function processCommand(){
        const consoleInput = $('.console-input');
        let command = consoleInput.text();
        let commands = command.split(' ');
        $('.console-input').remove();
        var $text = $('#console');
        $text.append("<p class='command'>" + command + '</p>');
        let currentRoomIx = player.roomIx;
        if(commands.length){
            if(commands[0].toLowerCase() == "go"){
                if(commands.length === 1){
                    $text.append("<p>Go where?.</p>");    
                }else{
                    var room = maze[player.roomIx];
                    if(commands[1].toLowerCase() == 'n' || commands[1].toLowerCase() == 'north'){
                        if(room.exits[0]<0 && room.exits[0] !== undiscovered){
                            $text.append("<p>There is no exit to the North.</p>");    
                        } else {
                            playerMove(room.exits[0], 0, -1, 0);
                        }
                    } else if(commands[1].toLowerCase() == 'e' || commands[1].toLowerCase() == 'east'){
                        if(room.exits[1]<0 && room.exits[1] !== undiscovered){
                            $text.append("<p>There is no exit to the East.</p>");    
                        } else {
                            playerMove(room.exits[1], 1, 0, 1);
                        }

                    } else if(commands[1].toLowerCase() == 's' || commands[1].toLowerCase() == 'south'){
                        if(room.exits[2]<0 && room.exits[2] !== undiscovered){
                            $text.append("<p>There is no exit to the South.</p>");    
                        } else {
                            playerMove(room.exits[2], 0, 1, 2);
                        }

                    } else if(commands[1].toLowerCase() == 'w' || commands[1].toLowerCase() == 'west'){
                        if(room.exits[3]<0 && room.exits[3] !== undiscovered){
                            $text.append("<p>There is no exit to the West.</p>");    
                        } else {
                            playerMove(room.exits[3],-1, 0, 3);
                        }

                    } else {
                        $text.append("<p>Direction not recognised.  Go where?.</p>");    
                    }
                }
            }
            else {
                $text.append("<p>Command not recognised.<p>");
            }
            if(currentRoomIx != player.roomIx){
                displayRoom();
            }
            waitForInput();
        }
    }

    function waitForInput(){
        var $text = $('#console');
        $text.append("<span class='console-input' contenteditable='true'></span><span class='caret'>|</span>");
        //$text.append("<span class='console-input' contenteditable='true'></span>");
        const consoleInput = $('.console-input');
        const caret = $('.caret');
        consoleInput.off('focus')
        .off('keypress')
        .off('input')
        .off('click');
        caret.hide();
        consoleInput.trigger('focus')
        .on('focus', function(){
            caret.hide();
        }).on('blur',function(){
            caret.show();
        }).on('keypress', function(e){
            if(e.key === 'Enter'){
                e.preventDefault();
                processCommand();
            }
        }).on('input', function(){
            const inputWidth = consoleInput.offsetWidth;
            caret.css({'left': `${inputWidth}px`});
        }).on('click',function(){
            consoleInput.trigger('focus');
        });

    }


    function displayRoom(){
        let ix = player.roomIx;
        let room = maze[ix];
        let message = "Exits are:";
        if(room.visited){
            message = "[" + ix + "] You are in a familiar room.  " + message;
        } else {
            message = "[" + ix + "] You have discovered a new room.  " + message;
        }
        room.visited = true;
        let exits = "";
        if(room.exits[0] >- 1 || room.exits[0] == undiscovered) {
            exits = "North";
        }
        if(room.exits[1] > -1 || room.exits[1] == undiscovered){
            if(exits.length>0)
            {
                exits += ", ";
            }
            exits += "East";
        }
        if(room.exits[2] > -1 || room.exits[2] == undiscovered){
            if(exits.length > 0)
            {
                exits += ", ";
            }
            exits += "South";
        }
        if(room.exits[3] > -1 || room.exits[3] == undiscovered){
            if(exits.length > 0)
            {
                exits += ", ";
            }
            exits += "West";
        }
        message = message + " " + exits;
        $('#console').append("<p>" + message + "</p>");
        drawMap(ix);
    }


    function createRoom(x, y, from, direction){
        // 0=North, 1=East, 2=South, 3=West
        let minExitCount = getUnexploredExitCount()<2?3:1;
        let uIx = 5-minExitCount;
        var room = {
            exits:[undiscovered,undiscovered,undiscovered,undiscovered],
            position:{x:x, y:y},
            stairsUp:(x==undiscovered && y==undiscovered)?true:false,
            stairsDown: false,
            visited:false
        };

        var exitCount = Math.floor(Math.random() * uIx) + minExitCount;
        var exits = [0, 1, 2, 3];
        let shuffledExits = shuffleArray(exits);
        let availableExits = shuffledExits.slice(0,exitCount);
        let returnDirection = -1;
        if(typeof direction !== 'undefined'){
            returnDirection = direction + 2;
            if(returnDirection>3){
                returnDirection -= 4;
            }
            if(!availableExits.includes(returnDirection)){
                availableExits[0] = returnDirection;
            }
        }
        room.exits[0] = availableExits.includes(0) ? returnDirection == 0 ? from : undiscovered : -1;
        room.exits[1] = availableExits.includes(1) ? returnDirection == 1 ? from : undiscovered : -1;
        room.exits[2] = availableExits.includes(2) ? returnDirection == 2 ? from : undiscovered : -1;
        room.exits[3] = availableExits.includes(3) ? returnDirection == 3 ? from : undiscovered : -1;

        if(room.exits[0] == undiscovered && getRoomIxAt(x, y - 1) != -1) {
            var otherRoomIx = getRoomIxAt(x, y - 1);
            var otherRoomExit = maze[otherRoomIx].exits[2];
            if(otherRoomExit == noExit){
                room.exits[0] = noExit;
            } else {
                room.exits[0] = otherRoomIx;
                maze[otherRoomIx].exits[2] = maze.length;
            }
        }
        if(room.exits[1] == undiscovered && getRoomIxAt(x + 1, y) != -1) {
            var otherRoomIx = getRoomIxAt(x + 1, y);
            var otherRoomExit = maze[otherRoomIx].exits[3];
            if(otherRoomExit == noExit){
                room.exits[1] = noExit;
            } else {
                room.exits[3] = otherRoomIx;
                maze[otherRoomIx].exits[3] = maze.length;
            }
        }
        if(room.exits[2] == undiscovered && getRoomIxAt(x, y + 1) != -1) {
            var otherRoomIx = getRoomIxAt(x, y + 1);
            var otherRoomExit = maze[otherRoomIx].exits[0];
            if(otherRoomExit == noExit){
                room.exits[2] = noExit;
            } else {
                room.exits[2] = otherRoomIx;
                maze[otherRoomIx].exits[0] = maze.length;
            }
        }
        if(room.exits[3] == undiscovered && getRoomIxAt(x - 1, y) != -1) {
            var otherRoomIx = getRoomIxAt(x - 1, y);
            var otherRoomExit = maze[otherRoomIx].exits[1];
            if(otherRoomExit == noExit){
                room.exits[3] = noExit;
            } else {
                room.exits[3] = otherRoomIx;
                maze[otherRoomIx].exits[1] = maze.length;
            }
        }
        if(getUnexploredExitCount() == 0 && x !== 0 && y !== 0){
            room.stairsDown = true;
        }
        maze.push(room);
        return maze.length - 1;
    }

    function getUnexploredExitCount(){
        var c = 0;
        $.each(maze,function(i,e){
            $.each(e.exist, function(ei,ee){
                if(ee == undiscovered){
                    c++;
                }
            })
        });
        return c;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    function getRoomIxAt(x,y){
        var room = -1;
        $.each(maze,function(i,e){
            if(e.position.x == x && e.position.y == y){
                room = i;
                return false;
            }
        });
        return room;
    }
});



