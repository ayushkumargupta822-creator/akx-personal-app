(()=> {
'use strict';
const $=id=>document.getElementById(id);
const COLORS=[
 {id:'red',name:'Red',hex:'#e53935',dark:'#a91616',start:0,base:[[1,1],[1,4],[4,1],[4,4]],lane:[[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],yard:[0,0]},
 {id:'green',name:'Green',hex:'#239b56',dark:'#126c39',start:13,base:[[1,10],[1,13],[4,10],[4,13]],lane:[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],yard:[0,9]},
 {id:'yellow',name:'Yellow',hex:'#f2c230',dark:'#ad8110',start:26,base:[[10,10],[10,13],[13,10],[13,13]],lane:[[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],yard:[9,9]},
 {id:'blue',name:'Blue',hex:'#2878d0',dark:'#15529a',start:39,base:[[10,1],[10,4],[13,1],[13,4]],lane:[[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],yard:[9,0]}
];
const TRACK=[[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
const SAFE=new Set([0,8,13,21,26,34,39,47]);
const DICE=['⚀','⚁','⚂','⚃','⚄','⚅'];
let game=null,busy=false,chosen=null,roll=0,animTimer=null;
function playersFromSetup(){const count=+$('ludoPlayers').value,mode=$('ludoMode').value;return COLORS.slice(0,count).map((c,i)=>({...c,computer:mode==='computer'&&i>0,tokens:Array.from({length:4},()=>-1)}))}
window.ludoModeChanged=()=>{$('ludoDifficultyWrap').style.display=$('ludoMode').value==='computer'?'block':'none'};
window.ludoStart=()=>{clearTimeout(animTimer);game={players:playersFromSetup(),turn:0,rolled:null,finished:null,gameOver:false,consecutiveSix:0,mode:$('ludoMode').value,difficulty:$('ludoDifficulty').value};busy=false;chosen=null;roll=0;$('ludoDice').textContent='⚀';$('ludoStatus').textContent='Roll a 6 to bring a token out of your yard.';render();};
function globalPos(p,progress){return (p.start+progress)%52}
function tokenMoves(p,t,d){const pos=p.tokens[t];if(pos===-1)return d===6?[t]:[];if(pos>=57)return [];return pos+d<=57?[t]:[]}
function occupancy(gpos,exceptPlayer,exceptToken){const found=[];game.players.forEach((p,pi)=>p.tokens.forEach((v,ti)=>{if(!(pi===exceptPlayer&&ti===exceptToken)&&v>=0&&v<52&&globalPos(p,v)===gpos)found.push({pi,ti})}));return found}
function safeAt(p,progress){return progress>=0&&progress<52&&SAFE.has(globalPos(p,progress))}
function render(){if(!game)return;renderBoard();const p=game.players[game.turn];$('ludoTurn').textContent=game.gameOver?'🏆 '+game.players[game.finished].name+' wins!':(p.computer?'🤖 ':'🎲 ')+p.name+"'s turn";$('ludoRoll').disabled=game.gameOver||game.rolled!==null||busy||p.computer;$('ludoPlayersInfo').innerHTML=game.players.map((x,i)=>{const home=x.tokens.filter(v=>v===57).length;const mark=x.computer?'AI':(i===0?'YOU':x.name.slice(0,1).toUpperCase());return '<div class="ludo-player-chip '+(i===game.turn?'active':'')+'" data-mark="'+mark+'" style="--player-color:'+x.hex+'"><b>'+(x.computer?'Computer · ':'Player · ')+x.name+'</b><span class="ludo-player-meta">'+home+'/4 tokens home</span></div>'}).join('')}
function cellType(r,c){for(let i=0;i<4;i++){const [rr,cc]=COLORS[i].yard;if(r>=rr&&r<rr+6&&c>=cc&&c<cc+6)return 'yard-'+COLORS[i].id}
if(r===7&&c===7)return 'center';
for(let i=0;i<4;i++)if(COLORS[i].lane.some(([rr,cc])=>rr===r&&cc===c))return 'lane-'+COLORS[i].id;
if(TRACK.some(([rr,cc])=>rr===r&&cc===c))return SAFE.has(TRACK.findIndex(([rr,cc])=>rr===r&&cc===c))?'safe':'track';
return '';
}
function renderBoard(){const host=$('ludoBoard');if(!host)return;let cells='';for(let r=0;r<15;r++)for(let c=0;c<15;c++){const type=cellType(r,c);let content='';if(type.startsWith('yard-')){const p=COLORS.find(x=>type==='yard-'+x.id);if(p.base.some(([rr,cc])=>rr===r&&cc===c))content='<div class="ludo-yard-spot"></div>';}
let tokens=[];game.players.forEach((p,pi)=>p.tokens.forEach((v,ti)=>{let coord=null;if(v===-1)coord=p.base[ti];else if(v<52)coord=TRACK[globalPos(p,v)];else if(v<57)coord=p.lane[v-52];if(coord&&coord[0]===r&&coord[1]===c)tokens.push({p,pi,ti,v})}));
if(type==='center')content='<div style="font-size:clamp(8px,2vw,18px);font-weight:900;color:#fff;text-shadow:0 1px 3px #333">AKX</div>';
if(tokens.length){content=tokens.map(o=>{const isSelectable=chosen&&chosen.pi===o.pi&&chosen.moves.includes(o.ti);return '<button class="ludo-token '+(isSelectable?'selectable':'')+'" style="background:'+o.p.hex+'!important;color:'+(o.p.id==='yellow'?'#352600':'white')+'!important" aria-label="'+o.p.name+' token '+(o.ti+1)+'" '+(isSelectable?'onclick="ludoMoveToken('+o.ti+')"':'disabled')+'>'<span>'+(o.pi+1)+'.'+(o.ti+1)+'</span></button>'}).join('')}
cells+='<div class="ludo-cell '+type+'" style="grid-row:'+(r+1)+';grid-column:'+(c+1)+'">'+content+'</div>'}
host.innerHTML=cells;
}
window.ludoRollDice=()=>{if(!game||game.gameOver||game.rolled!==null||busy||game.players[game.turn].computer)return;roll=1+Math.floor(Math.random()*6);afterRoll()};
function afterRoll(){game.rolled=roll;$('ludoDice').textContent=DICE[roll-1];const p=game.players[game.turn],moves=[];p.tokens.forEach((v,t)=>{if(tokenMoves(p,t,roll).length)moves.push(t)});if(roll===6)game.consecutiveSix++;else game.consecutiveSix=0;
if(game.consecutiveSix>=3){$('ludoStatus').textContent=p.name+' rolled three consecutive sixes. Turn skipped.';game.rolled=null;game.consecutiveSix=0;nextTurn();return}
if(!moves.length){$('ludoStatus').textContent='No valid move. '+(roll===6?'Roll a six gave another turn.':'Next player’s turn.');game.rolled=null;render();setTimeout(()=>{if(game&&!game.gameOver)nextTurn()},950);return}
chosen={pi:game.turn,moves};$('ludoStatus').textContent=moves.length===1?'Select the highlighted token to move.':'Choose one of your highlighted tokens.';render();if(p.computer){busy=true;render();animTimer=setTimeout(()=>{const t=chooseComputerMove(p,moves,roll);busy=false;moveToken(t)},650)}};
function scoreMove(p,t,d){const v=p.tokens[t],dest=v===-1?0:v+d;let score=Math.random()*2;if(dest===57)score+=1000;if(v===-1)score+=12;if(dest>=52)score+=dest>=57?1000:25+dest;
if(dest<52){const gp=globalPos(p,dest),enemies=occupancy(gp,game.turn,t).filter(o=>o.pi!==game.turn);if(enemies.length&&!SAFE.has(gp))score+=220+enemies.length*25;if(SAFE.has(gp))score+=15;game.players.forEach((op,oi)=>{if(oi===game.turn)return;op.tokens.forEach(ov=>{if(ov>=0&&ov<52){const ep=globalPos(op,ov),dist=(gp-ep+52)%52;if(dist>0&&dist<=6)score-=game.difficulty==='expert'?dist===1?18:dist===2?9:0:game.difficulty==='hard'?dist===1?12:0:0}})})}
if(game.difficulty==='easy')score=Math.random()*100;return score}
function chooseComputerMove(p,moves,d){if(game.difficulty==='easy')return moves[Math.floor(Math.random()*moves.length)];return moves.map(t=>({t,s:scoreMove(p,t,d)})).sort((a,b)=>b.s-a.s)[0].t}
window.ludoMoveToken=t=>{if(!game||busy||game.rolled===null||!chosen||!chosen.moves.includes(t)||chosen.pi!==game.turn)return;moveToken(t)};
function moveToken(t){const p=game.players[game.turn],d=game.rolled;if(d===null)return;let v=p.tokens[t];p.tokens[t]=v===-1?0:v+d;const dest=p.tokens[t];let captured=0;if(dest<52){const gp=globalPos(p,dest);if(!SAFE.has(gp)){game.players.forEach((op,oi)=>{if(oi===game.turn)return;op.tokens.forEach((ov,ti)=>{if(ov>=0&&ov<52&&globalPos(op,ov)===gp){op.tokens[ti]=-1;captured++}})})}}
chosen=null;game.rolled=null;const won=p.tokens.every(x=>x===57);if(won){game.gameOver=true;game.finished=game.turn;$('ludoStatus').textContent='🎉 '+p.name+' wins the game!';$('ludoDice').textContent='🏆';render();return}
$('ludoStatus').textContent=dest===57?'Token reached home!':captured?'Captured '+captured+' opponent token'+(captured>1?'s':'')+'!':v===-1?'Token entered the board.':'Token moved '+d+' spaces.';
render();if(d===6||captured||dest===57){if(d!==6)game.consecutiveSix=0;$('ludoStatus').textContent+=' '+p.name+' gets another turn.';setTimeout(()=>{if(game&&!game.gameOver)startComputerIfNeeded()},650)}else{game.consecutiveSix=0;setTimeout(()=>{if(game&&!game.gameOver)nextTurn()},650)}
}
function nextTurn(){if(!game||game.gameOver)return;game.turn=(game.turn+1)%game.players.length;game.rolled=null;chosen=null;busy=false;render();startComputerIfNeeded()}
function startComputerIfNeeded(){if(!game||game.gameOver)return;const p=game.players[game.turn];if(p.computer){busy=true;render();animTimer=setTimeout(()=>{if(!game||game.gameOver)return;roll=1+Math.floor(Math.random()*6);afterRoll()},650)}}
window.ludoMoveToken=window.ludoMoveToken;
window.ludoModeChanged();
window.ludoStart();
})();