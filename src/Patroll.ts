namespace NevMesh
{
	export class Patroll {

        public static polygonId: number = 1;

        public static computeCentroids (geometry: Geometry) {
            let f: number; 
            let fl: number;
            let face;
    
            for (f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
    
                face = geometry.faces[f];
                face.centroid = new Vector3( 0, 0, 0 );
                
                Vector3.add(face.centroid, geometry.vertices[ face.a ], face.centroid);
                Vector3.add(face.centroid, geometry.vertices[ face.b ], face.centroid);
                Vector3.add(face.centroid, geometry.vertices[ face.c ], face.centroid);
                Vector3.scale(face.centroid, 1/3, face.centroid);
            }
        };

        public static buildNavigationMesh (geometry: Geometry) {
            // Prepare geometry
            Patroll.computeCentroids(geometry);
            geometry.mergeVertices();

            let navigationMesh = Patroll.buildPolygonsFromGeometry(geometry);
            return navigationMesh;
        };


        public static buildPolygonsFromGeometry(geometry: Geometry) {

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
        };


        public static buildPolygonNeighbours (polygon, navigationMesh) {
            polygon.neighbours = [];

            // All other nodes that contain at least two of our vertices are our neighbours
            for (let i = 0, len = navigationMesh.polygons.length; i < len; i++) {
                if (polygon === navigationMesh.polygons[i]) continue;

                // Don't check polygons that are too far, since the intersection tests take a long time
                if (Vector3.distanceToSquared(polygon.centroid, navigationMesh.polygons[i].centroid) > 100 * 100) continue;

                let matches = Patroll.arrayIntersect(polygon.vertexIds, navigationMesh.polygons[i].vertexIds);
                // let matches = _.intersection(polygon.vertexIds, navigationMesh.polygons[i].vertexIds);

                if (matches.length >= 2) {
                    polygon.neighbours.push(navigationMesh.polygons[i]);
                }
            }
        };

        public static arrayIntersect(...params: any[]) {
            let i, all, shortest, nShortest, n, len, ret = [],
                obj = {},
                nOthers;
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
                        } else {
                            obj[elem] = i;
                        }
                    } else if (i === 0) {
                        obj[elem] = 0;
                    }
                }
            }
            return ret;
        }


        public static groupNavMesh(navigationMesh) {

            let saveObj = {
                vertices: null,
                groups: null
            };

            for (let i = 0, len = navigationMesh.vertices.length; i < len; i++) {
                let vertice = navigationMesh.vertices;
                vertice.x = Patroll.roundNumber(vertice.x, 2)
                vertice.y = Patroll.roundNumber(vertice.y, 2)
                vertice.z = Patroll.roundNumber(vertice.z, 2)
            }
    
            saveObj.vertices = navigationMesh.vertices;
    
            let groups = Patroll.buildPolygonGroups(navigationMesh);
    
            saveObj.groups = [];
    
            let findPolygonIndex = function (group, p) {
                for (let i = 0; i < group.length; i++) {
                    if (p === group[i]) return i;
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
        };


        public static getSharedVerticesInOrder(a, b) {

            let aList: any[] = a.vertexIds;
            let bList: any[] = b.vertexIds;
    
            let sharedVertices = [];
    
            for (let i = 0, len = aList.length; i < len; i++) {
                const vId = aList[i];
                if (bList.indexOf(vId) > -1) {
                    sharedVertices.push(vId);
                }
            }

            if (sharedVertices.length < 2) return [];
    
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


        public static buildPolygonGroups(navigationMesh) {
            let polygons = navigationMesh.polygons;
            let vertices = navigationMesh.vertices;
    
            let polygonGroups = [];
            let groupCount = 0;
    
            function spreadGroupId (polygon) {
                for (let i = 0, len = polygon.neighbours.length; i < len; i++) {
                    const neighbour = polygon.neighbours[i];
                    if (neighbour.group == undefined) {
                        neighbour.group = polygon.group;
                        spreadGroupId(neighbour);
                    }
                }
            };

            for (let i = 0,len = polygons.length; i < len; i++) {
                const polygon = polygons[i];

                if (polygon.group == undefined) {
                    polygon.group = groupCount++;
                    spreadGroupId(polygon);
                }
    
                if (!polygonGroups[polygon.group]) polygonGroups[polygon.group] = [];
    
                polygonGroups[polygon.group].push(polygon);
            }
    
            // console.log("Groups built: ", polygonGroups.length);
            return polygonGroups;
        };


        public static roundNumber(number: number, decimals: number) {
            let newnumber = new Number(number + '').toFixed(decimals);
            return parseFloat(newnumber);
        }

	}
}