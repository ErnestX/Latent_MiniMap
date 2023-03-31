import * as THREE from 'three';

// import { AppState } from "./appState.js";
// import { World } from "./world.js";

// AppState.width = 800;
// AppState.height = 600;

document.getElementById('MiniMap').style.width = 800; //AppState.width.toString().concat("px");
document.getElementById('MiniMap').style.height = 600; //AppState.height.toString().concat("px");

console.log("hello world");

// init

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.z = 1;

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

// animation

function animation( time ) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.render( scene, camera );

}



// const world = new World(AppState.width, AppState.height, AppState.numOfMountainsToGenerate);
// world.render();

// document.addEventListener("keydown", function(event) {
//   const key = event.key; // Or const {key} = event; in ES6+
//   switch (key) {
//     case "Escape":
//       world.unselect(); 
//       AppState.textBuffer = "";
//       break;
//     case "Enter":
//       AppState.selectedEpisode.text = AppState.textBuffer;
//       AppState.selectedEpisode.refreshText();
//       AppState.textBuffer = "";
//       break;
//     case "Shift":
//       break;
//     default:
//       AppState.textBuffer = AppState.textBuffer.concat(key);
//       AppState.selectedEpisode.text = AppState.textBuffer;
//       AppState.selectedEpisode.refreshText();
//       console.log("other key pressed");
//       console.log(AppState.textBuffer);
//   }
// });
