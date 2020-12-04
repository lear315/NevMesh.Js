
/*
    NevMesh.js - Navigation mesh toolkit for Laya base on PatrolJS
	https://gitee.com/lear315/nev-mesh.js
	Licensed under MIT
*/

namespace NevMesh
{
	export let zoneNodes = {};

	export function buildNodesByJson(json: any) {
		let p2=json.vertices;
		let ii=json.faces;
		let faces=[];
		for (let i=0; i < ii.length/5; i++){
			faces.push(new Face(ii[i*5+1],ii[i*5+2],ii[i*5+3]));
		};
		let p=[];
		for (let i=0; i < p2.length; i+=3){
			p.push(new Vector3(p2[i],p2[i+1],p2[i+2]));
		};

		let g=new Geometry();
		g.faces=faces;
		g.vertices=p;
		let zoneNodes = buildNodes(g);
		return zoneNodes;
	}

	export function buildNodes(geometry: Geometry) {
		let navigationMesh = Patroll.buildNavigationMesh(geometry);

		let zoneNodes = Patroll.groupNavMesh(navigationMesh);
		return zoneNodes;
	}

	export function setZoneData(zone: string, data) {
		zoneNodes[zone] = data;
	}

	export function getGroup(zone: string, position: Vector3) {

		if (!zoneNodes[zone]) return null;

		let closestNodeGroup = null;

		let distance = Math.pow(50, 2);

		for (let i = 0, len = zoneNodes[zone].groups.length; i < len; i++) {
			const group = zoneNodes[zone].groups[i];

			for (let j = 0, len2 = group.length; j < len2; j++) {
				const node = group[j];
				let measuredDistance = Vector3.distanceToSquared(node.centroid, position);
				if (measuredDistance < distance) {
					closestNodeGroup = i;
					distance = measuredDistance;
				}
			}
		}
		return closestNodeGroup;
	}


	export function getRandomNode(zone: string, group: number, nearPosition: Vector3, nearRange: number) {

		if (!zoneNodes[zone]) return new Vector3();

		nearPosition = nearPosition || null;
		nearRange = nearRange || 0;

		let candidates = [];

		let polygons = zoneNodes[zone].groups[group];

		for (let i = 0, len = polygons.length; i < len; i++) {
			const p = polygons[i];
			if (nearPosition && nearRange) {
				if (Vector3.distanceToSquared(nearPosition, p.centroid) < nearRange * nearRange) {
					candidates.push(p.centroid);
				}
			} else {
				candidates.push(p.centroid);
			}
		}

		if (candidates.length > 0) {
			let index = random(candidates.length);
			candidates[index]
	
			return candidates[index];
		}
	}

	export function findPath (startPosition: Vector3, targetPosition: Vector3, zone: string, group: number) {
		let allNodes = zoneNodes[zone].groups[group];
		let vertices = zoneNodes[zone].vertices;

		let closestNode = null;
		let distance = Math.pow(50, 2);

		for (let i = 0, len = allNodes.length; i < len; i++) {
			const node = allNodes[i];
			let measuredDistance = Vector3.distanceToSquared(node.centroid, startPosition);
			if (measuredDistance < distance) {
				closestNode = node;
				distance = measuredDistance;
			}
		}
		let farthestNode = null;
		distance = Math.pow(50, 2);

		for (let i = 0, len = allNodes.length; i < len; i++) {
			const node = allNodes[i];
			let measuredDistance = Vector3.distanceToSquared(node.centroid, targetPosition);
			if (measuredDistance < distance &&
				Vector3.isVectorInPolygon(targetPosition, node, vertices)) {
				farthestNode = node;
				distance = measuredDistance;
			}
		}

		// If we can't find any node, just go straight to the target
		if (!closestNode || !farthestNode) {
			return null;
		}

		let paths = Astar.search(allNodes, closestNode, farthestNode);

		let getPortalFromTo = function (a, b) {
			for (let i = 0; i < a.neighbours.length; i++) {
				if (a.neighbours[i] === b.id) {
					return a.portals[i];
				}
			}
		};

		// We got the corridor
		// Now pull the rope

		let channel = new Channel();

		channel.push(startPosition);

		for (let i = 0; i < paths.length; i++) {
			let polygon = paths[i];

			let nextPolygon = paths[i + 1];

			if (nextPolygon) {
				let portals = getPortalFromTo(polygon, nextPolygon);
				channel.push(
					vertices[portals[0]],
					vertices[portals[1]]
				);
			}

		}

		channel.push(targetPosition);

		channel.stringPull();


		let threeVectors = [];

		for (let i = 0, len = channel.path.length; i < len; i++) {
			const c = channel.path[i];
			let vec = new Vector3(c.x, c.y, c.z);
			threeVectors.push(vec);
		}
		// We don't need the first one, as we already know our start position
		threeVectors.shift();

		return threeVectors;
	}

}