import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.getElementById('MiniMap').style.width = 800; 
document.getElementById('MiniMap').style.height = 600; 

console.log("hello world");


// set up renderer, scene and camera

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );


// set up control 
const controls = new OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render );

const geometry1 = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
const material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );


//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

// geometry with some vertices
const points = [];
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points );


const line = new THREE.Line( geometry, material );
scene.add( line );
renderer.render( scene, camera );

function render() {
  renderer.render( scene, camera );
}
