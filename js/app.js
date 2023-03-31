import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.getElementById('MiniMap').style.width = 800; 
document.getElementById('MiniMap').style.height = 600; 


// set up renderer, scene and camera

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 50, 50, 50 );
camera.lookAt( 0, 0, 0 );


// set up control 
const controls = new OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render );


const material = new THREE.LineBasicMaterial( { color: 0xffffff } );

const origin = new THREE.Vector3( 0, 0, 0 )
const points1 = [];
points1.push(origin);
points1.push( new THREE.Vector3( 10, 0, 0 ) );
const geometry1 = new THREE.BufferGeometry().setFromPoints( points1 );
const line1 = new THREE.Line( geometry1, material );

const points2 = [];
points2.push(origin);
points2.push( new THREE.Vector3( 0, 10, 0 ) );
const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
const line2 = new THREE.Line( geometry2, material );

const points3 = [];
points3.push(origin);
points3.push( new THREE.Vector3( 0, 0, 10 ) );
const geometry3 = new THREE.BufferGeometry().setFromPoints( points3 );
const line3 = new THREE.Line( geometry3, material );

scene.add( line1 );
scene.add( line2 );
scene.add( line3 );

const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
const cube1 = new THREE.Mesh( cubeGeometry, material );
const cube2 = cube1.clone();
const cube3 = cube1.clone();
const cube4 = cube1.clone();

cube1.position.set(0,0,0);
cube2.position.set(10,0,0);
cube3.position.set(0,10,0);
cube4.position.set(0,0,10);

scene.add( cube1 );
scene.add( cube2 );
scene.add( cube3 );
scene.add( cube4 );

const materialSurf = new THREE.LineBasicMaterial( { color: 0x00AFFF } );
const vertices = [];

vertices.push(new THREE.Vector3(1,1,1));
vertices.push(new THREE.Vector3(10,0,10));
vertices.push(new THREE.Vector3(10,0,0));
const surfGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
const plane = new THREE.Mesh( surfGeometry, materialSurf );
scene.add(plane)


renderer.render( scene, camera );

function render() {
  renderer.render( scene, camera );
}
