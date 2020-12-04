var NevMesh;
(function (NevMesh) {
    class Astar {
        static init(graph) {
            for (let x = 0; x < graph.length; x++) {
                //for(let x in graph) {
                let node = graph[x];
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.cost = 1.0;
                node.visited = false;
                node.closed = false;
                node.parent = null;
            }
        }
        static cleanUp(graph) {
            for (let x = 0; x < graph.length; x++) {
                let node = graph[x];
                delete node.f;
                delete node.g;
                delete node.h;
                delete node.cost;
                delete node.visited;
                delete node.closed;
                delete node.parent;
            }
        }
        static heap() {
            return new NevMesh.BinaryHeap(function (node) {
                return node.f;
            });
        }
        static search(graph, start, end) {
            Astar.init(graph);
            //heuristic = heuristic || astar.manhattan;
            let openHeap = Astar.heap();
            openHeap.push(start);
            while (openHeap.size() > 0) {
                // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
                let currentNode = openHeap.pop();
                // End case -- result has been found, return the traced path.
                if (currentNode === end) {
                    let curr = currentNode;
                    let ret = [];
                    while (curr.parent) {
                        ret.push(curr);
                        curr = curr.parent;
                    }
                    this.cleanUp(ret);
                    return ret.reverse();
                }
                // Normal case -- move currentNode from open to closed, process each of its neighbours.
                currentNode.closed = true;
                // Find all neighbours for the current node. Optionally find diagonal neighbours as well (false by default).
                let neighbours = Astar.neighbours(graph, currentNode);
                for (let i = 0, il = neighbours.length; i < il; i++) {
                    let neighbour = neighbours[i];
                    if (neighbour.closed) {
                        // Not a valid node to process, skip to next neighbour.
                        continue;
                    }
                    // The g score is the shortest distance from start to current node.
                    // We need to check if the path we have arrived at this neighbour is the shortest one we have seen yet.
                    let gScore = currentNode.g + neighbour.cost;
                    let beenVisited = neighbour.visited;
                    if (!beenVisited || gScore < neighbour.g) {
                        // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                        neighbour.visited = true;
                        neighbour.parent = currentNode;
                        if (!neighbour.centroid || !end.centroid)
                            debugger;
                        neighbour.h = neighbour.h || Astar.heuristic(neighbour.centroid, end.centroid);
                        neighbour.g = gScore;
                        neighbour.f = neighbour.g + neighbour.h;
                        if (!beenVisited) {
                            // Pushing to heap will put it in proper place based on the 'f' value.
                            openHeap.push(neighbour);
                        }
                        else {
                            // Already seen the node, but since it has been rescored we need to reorder it in the heap
                            openHeap.rescoreElement(neighbour);
                        }
                    }
                }
            }
            // No result was found - empty array signifies failure to find path.
            return [];
        }
        static heuristic(pos1, pos2) {
            return NevMesh.Vector3.distanceToSquared(pos1, pos2);
        }
        static neighbours(graph, node) {
            let ret = [];
            for (let e = 0; e < node.neighbours.length; e++) {
                ret.push(graph[node.neighbours[e]]);
            }
            return ret;
        }
    }
    NevMesh.Astar = Astar;
})(NevMesh || (NevMesh = {}));
var NevMesh;
(function (NevMesh) {
    class BinaryHeap {
        constructor(scoreFunction) {
            this.content = [];
            this.scoreFunction = scoreFunction;
        }
        push(element) {
            // Add the new element to the end of the array.
            this.content.push(element);
            // Allow it to sink down.
            this.sinkDown(this.content.length - 1);
        }
        pop() {
            // Store the first element so we can return it later.
            let result = this.content[0];
            // Get the element at the end of the array.
            let end = this.content.pop();
            // If there are any elements left, put the end element at the
            // start, and let it bubble up.
            if (this.content.length > 0) {
                this.content[0] = end;
                this.bubbleUp(0);
            }
            return result;
        }
        remove(node) {
            let i = this.content.indexOf(node);
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            let end = this.content.pop();
            if (i !== this.content.length - 1) {
                this.content[i] = end;
                if (this.scoreFunction(end) < this.scoreFunction(node)) {
                    this.sinkDown(i);
                }
                else {
                    this.bubbleUp(i);
                }
            }
        }
        size() {
            return this.content.length;
        }
        rescoreElement(node) {
            this.sinkDown(this.content.indexOf(node));
        }
        sinkDown(n) {
            // Fetch the element that has to be sunk.
            let element = this.content[n];
            // When at 0, an element can not sink any further.
            while (n > 0) {
                // Compute the parent element's index, and fetch it.
                let parentN = ((n + 1) >> 1) - 1, parent = this.content[parentN];
                // Swap the elements if the parent is greater.
                if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                    this.content[parentN] = element;
                    this.content[n] = parent;
                    // Update 'n' to continue at the new position.
                    n = parentN;
                }
                // Found a parent that is less, no need to sink any further.
                else {
                    break;
                }
            }
        }
        bubbleUp(n) {
            // Look up the target element and its score.
            let length = this.content.length, element = this.content[n], elemScore = this.scoreFunction(element);
            while (true) {
                // Compute the indices of the child elements.
                let child2N = (n + 1) << 1, child1N = child2N - 1;
                // This is used to store the new position of the element,
                // if any.
                let swap = null;
                let child1Score;
                // If the first child exists (is inside the array)...
                if (child1N < length) {
                    // Look it up and compute its score.
                    let child1 = this.content[child1N];
                    child1Score = this.scoreFunction(child1);
                    // If the score is less than our element's, we need to swap.
                    if (child1Score < elemScore)
                        swap = child1N;
                }
                // Do the same checks for the other child.
                if (child2N < length) {
                    let child2 = this.content[child2N], child2Score = this.scoreFunction(child2);
                    if (child2Score < (swap === null ? elemScore : child1Score)) {
                        swap = child2N;
                    }
                }
                // If the element needs to be moved, swap it, and continue.
                if (swap !== null) {
                    this.content[n] = this.content[swap];
                    this.content[swap] = element;
                    n = swap;
                }
                // Otherwise, we are done.
                else {
                    break;
                }
            }
        }
    }
    NevMesh.BinaryHeap = BinaryHeap;
})(NevMesh || (NevMesh = {}));
var NevMesh;
(function (NevMesh) {
    class Channel {
        constructor() {
            this.portals = [];
        }
        push(p1, p2) {
            if (p2 === undefined)
                p2 = p1;
            this.portals.push({
                left: p1,
                right: p2
            });
        }
        ;
        triarea2(a, b, c) {
            var ax = b.x - a.x;
            var az = b.z - a.z;
            var bx = c.x - a.x;
            var bz = c.z - a.z;
            return bx * az - ax * bz;
        }
        vequal(a, b) {
            return NevMesh.Vector3.distanceToSquared(a, b) < 0.00001;
        }
        stringPull() {
            let portals = this.portals;
            let pts = [];
            // Init scan state
            let portalApex, portalLeft, portalRight;
            let apexIndex = 0, leftIndex = 0, rightIndex = 0;
            portalApex = portals[0].left;
            portalLeft = portals[0].left;
            portalRight = portals[0].right;
            // Add start point.
            pts.push(portalApex);
            for (let i = 1; i < portals.length; i++) {
                let left = portals[i].left;
                let right = portals[i].right;
                // Update right vertex.
                if (this.triarea2(portalApex, portalRight, right) <= 0.0) {
                    if (this.vequal(portalApex, portalRight) || this.triarea2(portalApex, portalLeft, right) > 0.0) {
                        // Tighten the funnel.
                        portalRight = right;
                        rightIndex = i;
                    }
                    else {
                        // Right over left, insert left to path and restart scan from portal left point.
                        pts.push(portalLeft);
                        // Make current left the new apex.
                        portalApex = portalLeft;
                        apexIndex = leftIndex;
                        // Reset portal
                        portalLeft = portalApex;
                        portalRight = portalApex;
                        leftIndex = apexIndex;
                        rightIndex = apexIndex;
                        // Restart scan
                        i = apexIndex;
                        continue;
                    }
                }
                // Update left vertex.
                if (this.triarea2(portalApex, portalLeft, left) >= 0.0) {
                    if (this.vequal(portalApex, portalLeft) || this.triarea2(portalApex, portalRight, left) < 0.0) {
                        // Tighten the funnel.
                        portalLeft = left;
                        leftIndex = i;
                    }
                    else {
                        // Left over right, insert right to path and restart scan from portal right point.
                        pts.push(portalRight);
                        // Make current right the new apex.
                        portalApex = portalRight;
                        apexIndex = rightIndex;
                        // Reset portal
                        portalLeft = portalApex;
                        portalRight = portalApex;
                        leftIndex = apexIndex;
                        rightIndex = apexIndex;
                        // Restart scan
                        i = apexIndex;
                        continue;
                    }
                }
            }
            if ((pts.length === 0) || (!this.vequal(pts[pts.length - 1], portals[portals.length - 1].left))) {
                // Append last point to path.
                pts.push(portals[portals.length - 1].left);
            }
            this.path = pts;
            return pts;
        }
        ;
    }
    NevMesh.Channel = Channel;
})(NevMesh || (NevMesh = {}));
var NevMesh;
(function (NevMesh) {
    class Face {
        constructor(a, b, c) {
            this.a = 0;
            this.b = 0;
            this.c = 0;
            this.c = c;
            this.b = b;
            this.a = a;
        }
    }
    NevMesh.Face = Face;
})(NevMesh || (NevMesh = {}));
var NevMesh;
(function (NevMesh) {
    class Geometry {
        constructor() {
            this.faces = [];
            this.vertices = [];
        }
        mergeVertices() {
            let verticesMap = {};
            let unique = new Array, changes = [];
            let v, key;
            let precisionPoints = 4;
            let precision = Math.pow(10, precisionPoints);
            let i, il, face;
            let indices;
            for (i = 0, il = this.vertices.length; i < il; i++) {
                v = this.vertices[i];
                key = Math.round(v.x * precision) + '_' + Math.round(v.y * precision) + '_' + Math.round(v.z * precision);
                if (verticesMap[key] == null) {
                    verticesMap[key] = i;
                    unique.push(v);
                    changes[i] = unique.length - 1;
                }
                else {
                    changes[i] = changes[verticesMap[key]];
                }
            }
            ;
            let faceIndicesToRemove = [];
            for (i = 0, il = this.faces.length; i < il; i++) {
                face = this.faces[i];
                face.a = changes[face.a];
                face.b = changes[face.b];
                face.c = changes[face.c];
                indices = [face.a, face.b, face.c];
                let dupIndex = -1;
                for (let n = 0; n < 3; n++) {
                    if (indices[n] == indices[(n + 1) % 3]) {
                        dupIndex = n;
                        faceIndicesToRemove.push(i);
                        break;
                    }
                }
            }
            for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
                let idx = faceIndicesToRemove[i];
                this.faces.splice(idx, 1);
            }
            ;
            let diff = this.vertices.length - unique.length;
            this.vertices = unique;
            return diff;
        }
    }
    NevMesh.Geometry = Geometry;
})(NevMesh || (NevMesh = {}));
/*
    NevMesh.js - Navigation mesh toolkit for Laya base on PatrolJS
    https://gitee.com/lear315/nev-mesh.js
    Licensed under MIT
*/
var NevMesh;
(function (NevMesh) {
    NevMesh.zoneNodes = {};
    function buildNodesByJson(json) {
        let p2 = json.vertices;
        let ii = json.faces;
        let faces = [];
        for (let i = 0; i < ii.length / 5; i++) {
            faces.push(new NevMesh.Face(ii[i * 5 + 1], ii[i * 5 + 2], ii[i * 5 + 3]));
        }
        ;
        let p = [];
        for (let i = 0; i < p2.length; i += 3) {
            p.push(new NevMesh.Vector3(p2[i], p2[i + 1], p2[i + 2]));
        }
        ;
        let g = new NevMesh.Geometry();
        g.faces = faces;
        g.vertices = p;
        let zoneNodes = buildNodes(g);
        return zoneNodes;
    }
    NevMesh.buildNodesByJson = buildNodesByJson;
    function buildNodes(geometry) {
        let navigationMesh = NevMesh.Patroll.buildNavigationMesh(geometry);
        let zoneNodes = NevMesh.Patroll.groupNavMesh(navigationMesh);
        return zoneNodes;
    }
    NevMesh.buildNodes = buildNodes;
    function setZoneData(zone, data) {
        NevMesh.zoneNodes[zone] = data;
    }
    NevMesh.setZoneData = setZoneData;
    function getGroup(zone, position) {
        if (!NevMesh.zoneNodes[zone])
            return null;
        let closestNodeGroup = null;
        let distance = Math.pow(50, 2);
        for (let i = 0, len = NevMesh.zoneNodes[zone].groups.length; i < len; i++) {
            const group = NevMesh.zoneNodes[zone].groups[i];
            for (let j = 0, len2 = group.length; j < len2; j++) {
                const node = group[j];
                let measuredDistance = NevMesh.Vector3.distanceToSquared(node.centroid, position);
                if (measuredDistance < distance) {
                    closestNodeGroup = i;
                    distance = measuredDistance;
                }
            }
        }
        return closestNodeGroup;
    }
    NevMesh.getGroup = getGroup;
    function getRandomNode(zone, group, nearPosition, nearRange) {
        if (!NevMesh.zoneNodes[zone])
            return new NevMesh.Vector3();
        nearPosition = nearPosition || null;
        nearRange = nearRange || 0;
        let candidates = [];
        let polygons = NevMesh.zoneNodes[zone].groups[group];
        for (let i = 0, len = polygons.length; i < len; i++) {
            const p = polygons[i];
            if (nearPosition && nearRange) {
                if (NevMesh.Vector3.distanceToSquared(nearPosition, p.centroid) < nearRange * nearRange) {
                    candidates.push(p.centroid);
                }
            }
            else {
                candidates.push(p.centroid);
            }
        }
        if (candidates.length > 0) {
            let index = NevMesh.random(candidates.length);
            candidates[index];
            return candidates[index];
        }
    }
    NevMesh.getRandomNode = getRandomNode;
    function findPath(startPosition, targetPosition, zone, group) {
        let allNodes = NevMesh.zoneNodes[zone].groups[group];
        let vertices = NevMesh.zoneNodes[zone].vertices;
        let closestNode = null;
        let distance = Math.pow(50, 2);
        for (let i = 0, len = allNodes.length; i < len; i++) {
            const node = allNodes[i];
            let measuredDistance = NevMesh.Vector3.distanceToSquared(node.centroid, startPosition);
            if (measuredDistance < distance) {
                closestNode = node;
                distance = measuredDistance;
            }
        }
        let farthestNode = null;
        distance = Math.pow(50, 2);
        for (let i = 0, len = allNodes.length; i < len; i++) {
            const node = allNodes[i];
            let measuredDistance = NevMesh.Vector3.distanceToSquared(node.centroid, targetPosition);
            if (measuredDistance < distance &&
                NevMesh.Vector3.isVectorInPolygon(targetPosition, node, vertices)) {
                farthestNode = node;
                distance = measuredDistance;
            }
        }
        // If we can't find any node, just go straight to the target
        if (!closestNode || !farthestNode) {
            return null;
        }
        let paths = NevMesh.Astar.search(allNodes, closestNode, farthestNode);
        let getPortalFromTo = function (a, b) {
            for (let i = 0; i < a.neighbours.length; i++) {
                if (a.neighbours[i] === b.id) {
                    return a.portals[i];
                }
            }
        };
        // We got the corridor
        // Now pull the rope
        let channel = new NevMesh.Channel();
        channel.push(startPosition);
        for (let i = 0; i < paths.length; i++) {
            let polygon = paths[i];
            let nextPolygon = paths[i + 1];
            if (nextPolygon) {
                let portals = getPortalFromTo(polygon, nextPolygon);
                channel.push(vertices[portals[0]], vertices[portals[1]]);
            }
        }
        channel.push(targetPosition);
        channel.stringPull();
        let threeVectors = [];
        for (let i = 0, len = channel.path.length; i < len; i++) {
            const c = channel.path[i];
            let vec = new NevMesh.Vector3(c.x, c.y, c.z);
            threeVectors.push(vec);
        }
        // We don't need the first one, as we already know our start position
        threeVectors.shift();
        return threeVectors;
    }
    NevMesh.findPath = findPath;
})(NevMesh || (NevMesh = {}));
var NevMesh;
(function (NevMesh) {
    class Patroll {
        static computeCentroids(geometry) {
            let f;
            let fl;
            let face;
            for (f = 0, fl = geometry.faces.length; f < fl; f++) {
                face = geometry.faces[f];
                face.centroid = new NevMesh.Vector3(0, 0, 0);
                NevMesh.Vector3.add(face.centroid, geometry.vertices[face.a], face.centroid);
                NevMesh.Vector3.add(face.centroid, geometry.vertices[face.b], face.centroid);
                NevMesh.Vector3.add(face.centroid, geometry.vertices[face.c], face.centroid);
                NevMesh.Vector3.scale(face.centroid, 1 / 3, face.centroid);
            }
        }
        ;
        static buildNavigationMesh(geometry) {
            // Prepare geometry
            Patroll.computeCentroids(geometry);
            geometry.mergeVertices();
            let navigationMesh = Patroll.buildPolygonsFromGeometry(geometry);
            return navigationMesh;
        }
        ;
        static buildPolygonsFromGeometry(geometry) {
            // console.log("Vertices:", geometry.vertices.length, "polygons:", geometry.faces.length);
            let polygons = [];
            let vertices = geometry.vertices;
            // Convert the faces into a custom format that supports more than 3 vertices
            for (let i = 0, len = geometry.faces.length; i < len; i++) {
                let face = geometry.faces[i];
                polygons.push({
                    id: Patroll.polygonId++,
                    vertexIds: [face.a, face.b, face.c],
                    centroid: face.centroid,
                    normal: face.normal,
                    neighbours: []
                });
            }
            let navigationMesh = {
                polygons: polygons,
                vertices: vertices,
            };
            // Build a list of adjacent polygons
            for (let i = 0, len = polygons.length; i < len; i++) {
                let polygon = polygons[i];
                Patroll.buildPolygonNeighbours(polygon, navigationMesh);
            }
            return navigationMesh;
        }
        ;
        static buildPolygonNeighbours(polygon, navigationMesh) {
            polygon.neighbours = [];
            // All other nodes that contain at least two of our vertices are our neighbours
            for (let i = 0, len = navigationMesh.polygons.length; i < len; i++) {
                if (polygon === navigationMesh.polygons[i])
                    continue;
                // Don't check polygons that are too far, since the intersection tests take a long time
                if (NevMesh.Vector3.distanceToSquared(polygon.centroid, navigationMesh.polygons[i].centroid) > 100 * 100)
                    continue;
                let matches = Patroll.arrayIntersect(polygon.vertexIds, navigationMesh.polygons[i].vertexIds);
                // let matches = _.intersection(polygon.vertexIds, navigationMesh.polygons[i].vertexIds);
                if (matches.length >= 2) {
                    polygon.neighbours.push(navigationMesh.polygons[i]);
                }
            }
        }
        ;
        static arrayIntersect(...params) {
            let i, all, shortest, nShortest, n, len, ret = [], obj = {}, nOthers;
            nOthers = params.length - 1;
            nShortest = params[0].length;
            shortest = 0;
            for (i = 0; i <= nOthers; i++) {
                n = params[i].length;
                if (n < nShortest) {
                    shortest = i;
                    nShortest = n;
                }
            }
            for (i = 0; i <= nOthers; i++) {
                n = (i === shortest) ? 0 : (i || shortest); //Read the shortest array first. Read the first array instead of the shortest
                len = params[n].length;
                for (let j = 0; j < len; j++) {
                    let elem = params[n][j];
                    if (obj[elem] === i - 1) {
                        if (i === nOthers) {
                            ret.push(elem);
                            obj[elem] = 0;
                        }
                        else {
                            obj[elem] = i;
                        }
                    }
                    else if (i === 0) {
                        obj[elem] = 0;
                    }
                }
            }
            return ret;
        }
        static groupNavMesh(navigationMesh) {
            let saveObj = {
                vertices: null,
                groups: null
            };
            for (let i = 0, len = navigationMesh.vertices.length; i < len; i++) {
                let vertice = navigationMesh.vertices;
                vertice.x = Patroll.roundNumber(vertice.x, 2);
                vertice.y = Patroll.roundNumber(vertice.y, 2);
                vertice.z = Patroll.roundNumber(vertice.z, 2);
            }
            saveObj.vertices = navigationMesh.vertices;
            let groups = Patroll.buildPolygonGroups(navigationMesh);
            saveObj.groups = [];
            let findPolygonIndex = function (group, p) {
                for (let i = 0; i < group.length; i++) {
                    if (p === group[i])
                        return i;
                }
            };
            for (let i = 0, len = groups.length; i < len; i++) {
                const group = groups[i];
                let newGroup = [];
                for (let j = 0, len2 = group.length; j < len2; j++) {
                    const p = group[j];
                    let neighbours = [];
                    let portals = [];
                    for (let z = 0, len3 = p.neighbours.length; z < len3; z++) {
                        const n = p.neighbours[z];
                        neighbours.push(findPolygonIndex(group, n));
                        portals.push(Patroll.getSharedVerticesInOrder(p, n));
                    }
                    p.centroid.x = Patroll.roundNumber(p.centroid.x, 2);
                    p.centroid.y = Patroll.roundNumber(p.centroid.y, 2);
                    p.centroid.z = Patroll.roundNumber(p.centroid.z, 2);
                    newGroup.push({
                        id: findPolygonIndex(group, p),
                        neighbours: neighbours,
                        vertexIds: p.vertexIds,
                        centroid: p.centroid,
                        portals: portals
                    });
                }
                saveObj.groups.push(newGroup);
            }
            return saveObj;
        }
        ;
        static getSharedVerticesInOrder(a, b) {
            let aList = a.vertexIds;
            let bList = b.vertexIds;
            let sharedVertices = [];
            for (let i = 0, len = aList.length; i < len; i++) {
                const vId = aList[i];
                if (bList.indexOf(vId) > -1) {
                    sharedVertices.push(vId);
                }
            }
            if (sharedVertices.length < 2)
                return [];
            // console.log("TRYING aList:", aList, ", bList:", bList, ", sharedVertices:", sharedVertices);
            if (sharedVertices.indexOf(aList[0]) > -1 && sharedVertices.indexOf(aList[aList.length - 1]) > -1) {
                // Vertices on both edges are bad, so shift them once to the left
                aList.push(aList.shift());
            }
            if (sharedVertices.indexOf(bList[0]) > -1 && sharedVertices.indexOf(bList[bList.length - 1]) > -1) {
                // Vertices on both edges are bad, so shift them once to the left
                bList.push(bList.shift());
            }
            // Again!
            sharedVertices = [];
            for (let i = 0, len = aList.length; i < len; i++) {
                const vId = aList[i];
                if (bList.indexOf(vId) > -1) {
                    sharedVertices.push(vId);
                }
            }
            return sharedVertices;
        }
        static buildPolygonGroups(navigationMesh) {
            let polygons = navigationMesh.polygons;
            let vertices = navigationMesh.vertices;
            let polygonGroups = [];
            let groupCount = 0;
            function spreadGroupId(polygon) {
                for (let i = 0, len = polygon.neighbours.length; i < len; i++) {
                    const neighbour = polygon.neighbours[i];
                    if (neighbour.group == undefined) {
                        neighbour.group = polygon.group;
                        spreadGroupId(neighbour);
                    }
                }
            }
            ;
            for (let i = 0, len = polygons.length; i < len; i++) {
                const polygon = polygons[i];
                if (polygon.group == undefined) {
                    polygon.group = groupCount++;
                    spreadGroupId(polygon);
                }
                if (!polygonGroups[polygon.group])
                    polygonGroups[polygon.group] = [];
                polygonGroups[polygon.group].push(polygon);
            }
            // console.log("Groups built: ", polygonGroups.length);
            return polygonGroups;
        }
        ;
        static roundNumber(number, decimals) {
            let newnumber = new Number(number + '').toFixed(decimals);
            return parseFloat(newnumber);
        }
    }
    Patroll.polygonId = 1;
    NevMesh.Patroll = Patroll;
})(NevMesh || (NevMesh = {}));
var NevMesh;
(function (NevMesh) {
    function random(n, t = null) {
        return null == t && (t = n, n = 0), n + Math.floor(Math.random() * (t - n + 1));
    }
    NevMesh.random = random;
})(NevMesh || (NevMesh = {}));
var NevMesh;
(function (NevMesh) {
    class Vector3 {
        /**
         * 创建一个 <code>Vector3</code> 实例。
         * @param	x  X轴坐标。
         * @param	y  Y轴坐标。
         * @param	z  Z轴坐标。
         */
        constructor(x = 0, y = 0, z = 0, nativeElements = null /*[NATIVE]*/) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        /**
         * 求两个三维向量的和。
         * @param	a left三维向量。
         * @param	b right三维向量。
         * @param	out 输出向量。
         */
        static add(a, b, out) {
            out.x = a.x + b.x;
            out.y = a.y + b.y;
            out.z = a.z + b.z;
        }
        /**
         * 求两个三维向量的差。
         * @param	a  left三维向量。
         * @param	b  right三维向量。
         * @param	o out 输出向量。
         */
        static subtract(a, b, o) {
            o.x = a.x - b.x;
            o.y = a.y - b.y;
            o.z = a.z - b.z;
        }
        /**
         * 求两个三维向量的叉乘。
         * @param	a left向量。
         * @param	b right向量。
         * @param	o 输出向量。
         */
        static cross(a, b, o) {
            let ax = a.x, ay = a.y, az = a.z, bx = b.x, by = b.y, bz = b.z;
            o.x = ay * bz - az * by;
            o.y = az * bx - ax * bz;
            o.z = ax * by - ay * bx;
        }
        /**
         * 求两个三维向量的点积。
         * @param	a left向量。
         * @param	b right向量。
         * @return   点积。
         */
        static dot(a, b) {
            return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
        }
        /**
         * 计算标量长度。
         * @param	a 源三维向量。
         * @return 标量长度。
         */
        static scalarLength(a) {
            let x = a.x, y = a.y, z = a.z;
            return Math.sqrt(x * x + y * y + z * z);
        }
        /**
         * 计算标量长度的平方。
         * @param	a 源三维向量。
         * @return 标量长度的平方。
         */
        static scalarLengthSquared(a) {
            let x = a.x, y = a.y, z = a.z;
            return x * x + y * y + z * z;
        }
        /**
         * 归一化三维向量。
         * @param	s 源三维向量。
         * @param	out 输出三维向量。
         */
        static normalize(s, out) {
            let x = s.x, y = s.y, z = s.z;
            let len = x * x + y * y + z * z;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
                out.x = x * len;
                out.y = y * len;
                out.z = z * len;
            }
        }
        /**
         * 计算两个三维向量的乘积。
         * @param	a left三维向量。
         * @param	b right三维向量。
         * @param	out 输出三维向量。
         */
        static multiply(a, b, out) {
            out.x = a.x * b.x;
            out.y = a.y * b.y;
            out.z = a.z * b.z;
        }
        /**
         * 缩放三维向量。
         * @param	a 源三维向量。
         * @param	b 缩放值。
         * @param	out 输出三维向量。
         */
        static scale(a, b, out) {
            out.x = a.x * b;
            out.y = a.y * b;
            out.z = a.z * b;
        }
        /**
         * 插值三维向量。
         * @param	a left向量。
         * @param	b right向量。
         * @param	t 插值比例。
         * @param	out 输出向量。
         */
        static lerp(a, b, t, out) {
            let ax = a.x, ay = a.y, az = a.z;
            out.x = ax + t * (b.x - ax);
            out.y = ay + t * (b.y - ay);
            out.z = az + t * (b.z - az);
        }
        static distanceToSquared(a, b) {
            let dx = a.x - b.x;
            let dy = a.y - b.y;
            let dz = a.z - b.z;
            return dx * dx + dy * dy + dz * dz;
        }
        static isVectorInPolygon(vector, polygon, vertices) {
            // reference point will be the centroid of the polygon
            // We need to rotate the vector as well as all the points which the polygon uses
            let center = polygon.centroid;
            let lowestPoint = 100000;
            let highestPoint = -100000;
            let polygonVertices = [];
            for (let i = 0, len = polygon.vertexIds.length; i < len; i++) {
                const vId = polygon.vertexIds[i];
                lowestPoint = Math.min(vertices[vId].y, lowestPoint);
                highestPoint = Math.max(vertices[vId].y, highestPoint);
                polygonVertices.push(vertices[vId]);
            }
            if (vector.y < highestPoint + 0.5 && vector.y > lowestPoint - 0.5 &&
                Vector3.isPointInPoly(polygonVertices, vector)) {
                return true;
            }
            return false;
        }
        static isPointInPoly(poly, pt) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].z <= pt.z && pt.z < poly[j].z) || (poly[j].z <= pt.z && pt.z < poly[i].z)) && (pt.x < (poly[j].x - poly[i].x) * (pt.z - poly[i].z) / (poly[j].z - poly[i].z) + poly[i].x) && (c = !c);
            return c;
        }
        /**
         * 克隆。
         * @param	destObject 克隆源。
         */
        cloneTo(destObject) {
            let destVector3 = destObject;
            destVector3.x = this.x;
            destVector3.y = this.y;
            destVector3.z = this.z;
        }
        /**
         * 克隆。
         * @return	 克隆副本。
         */
        clone() {
            let destVector3 = new Vector3();
            this.cloneTo(destVector3);
            return destVector3;
        }
    }
    NevMesh.Vector3 = Vector3;
})(NevMesh || (NevMesh = {}));
//# sourceMappingURL=NevMesh.js.map