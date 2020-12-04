// javascript-astar
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a binary heap.
namespace NevMesh
{
    export class Astar {

        public static init(graph) {
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

        public static cleanUp(graph) {
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

        public static heap() {
            return new BinaryHeap(function (node) {
                return node.f;
            });
        }

        public static search (graph, start, end) {
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
                        if (!neighbour.centroid || !end.centroid) debugger;
                        neighbour.h = neighbour.h || Astar.heuristic(neighbour.centroid, end.centroid);
                        neighbour.g = gScore;
                        neighbour.f = neighbour.g + neighbour.h;

                        if (!beenVisited) {
                            // Pushing to heap will put it in proper place based on the 'f' value.
                            openHeap.push(neighbour);
                        } else {
                            // Already seen the node, but since it has been rescored we need to reorder it in the heap
                            openHeap.rescoreElement(neighbour);
                        }
                    }
                }
            }

            // No result was found - empty array signifies failure to find path.
            return [];
        }

        public static heuristic(pos1, pos2) {
            return Vector3.distanceToSquared(pos1, pos2);
        }

        public static neighbours(graph, node) {
            let ret = [];

            for (let e = 0; e < node.neighbours.length; e++) {
                ret.push(graph[node.neighbours[e]]);
            }
            return ret;
        }
    
    }
}