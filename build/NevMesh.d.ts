declare namespace NevMesh {
    class Astar {
        static init(graph: any): void;
        static cleanUp(graph: any): void;
        static heap(): BinaryHeap;
        static search(graph: any, start: any, end: any): any[];
        static heuristic(pos1: any, pos2: any): number;
        static neighbours(graph: any, node: any): any[];
    }
}
declare namespace NevMesh {
    class BinaryHeap {
        content: any;
        scoreFunction: any;
        constructor(scoreFunction: any);
        push(element: any): void;
        pop(): any;
        remove(node: any): void;
        size(): any;
        rescoreElement(node: any): void;
        sinkDown(n: any): void;
        bubbleUp(n: any): void;
    }
}
declare namespace NevMesh {
    class Channel {
        portals: any[];
        path: any[];
        push(p1: any, p2?: any): void;
        triarea2(a: any, b: any, c: any): number;
        vequal(a: any, b: any): boolean;
        stringPull(): any[];
    }
}
declare namespace NevMesh {
    class Face {
        a: number;
        b: number;
        c: number;
        centroid: Vector3;
        normal: any;
        constructor(a: number, b: number, c: number);
    }
}
declare namespace NevMesh {
    class Geometry {
        faces: Face[];
        vertices: Vector3[];
        constructor();
        mergeVertices(): number;
    }
}
declare namespace NevMesh {
    let zoneNodes: {};
    function buildNodesByJson(json: any): {
        vertices: any;
        groups: any;
    };
    function buildNodes(geometry: Geometry): {
        vertices: any;
        groups: any;
    };
    function setZoneData(zone: string, data: any): void;
    function getGroup(zone: string, position: Vector3): any;
    function getRandomNode(zone: string, group: number, nearPosition: Vector3, nearRange: number): any;
    function findPath(startPosition: Vector3, targetPosition: Vector3, zone: string, group: number): any[];
}
declare namespace NevMesh {
    class Patroll {
        static polygonId: number;
        static computeCentroids(geometry: Geometry): void;
        static buildNavigationMesh(geometry: Geometry): {
            polygons: any[];
            vertices: Vector3[];
        };
        static buildPolygonsFromGeometry(geometry: Geometry): {
            polygons: any[];
            vertices: Vector3[];
        };
        static buildPolygonNeighbours(polygon: any, navigationMesh: any): void;
        static arrayIntersect(...params: any[]): any[];
        static groupNavMesh(navigationMesh: any): {
            vertices: any;
            groups: any;
        };
        static getSharedVerticesInOrder(a: any, b: any): any[];
        static buildPolygonGroups(navigationMesh: any): any[];
        static roundNumber(number: number, decimals: number): number;
    }
}
declare namespace NevMesh {
    function random(n: number, t?: number): number;
}
declare namespace NevMesh {
    class Vector3 {
        /**X轴坐标*/
        x: number;
        /**Y轴坐标*/
        y: number;
        /**Z轴坐标*/
        z: number;
        /**
         * 创建一个 <code>Vector3</code> 实例。
         * @param	x  X轴坐标。
         * @param	y  Y轴坐标。
         * @param	z  Z轴坐标。
         */
        constructor(x?: number, y?: number, z?: number, nativeElements?: Float32Array);
        /**
         * 求两个三维向量的和。
         * @param	a left三维向量。
         * @param	b right三维向量。
         * @param	out 输出向量。
         */
        static add(a: Vector3, b: Vector3, out: Vector3): void;
        /**
         * 求两个三维向量的差。
         * @param	a  left三维向量。
         * @param	b  right三维向量。
         * @param	o out 输出向量。
         */
        static subtract(a: Vector3, b: Vector3, o: Vector3): void;
        /**
         * 求两个三维向量的叉乘。
         * @param	a left向量。
         * @param	b right向量。
         * @param	o 输出向量。
         */
        static cross(a: Vector3, b: Vector3, o: Vector3): void;
        /**
         * 求两个三维向量的点积。
         * @param	a left向量。
         * @param	b right向量。
         * @return   点积。
         */
        static dot(a: Vector3, b: Vector3): number;
        /**
         * 计算标量长度。
         * @param	a 源三维向量。
         * @return 标量长度。
         */
        static scalarLength(a: Vector3): number;
        /**
         * 计算标量长度的平方。
         * @param	a 源三维向量。
         * @return 标量长度的平方。
         */
        static scalarLengthSquared(a: Vector3): number;
        /**
         * 归一化三维向量。
         * @param	s 源三维向量。
         * @param	out 输出三维向量。
         */
        static normalize(s: Vector3, out: Vector3): void;
        /**
         * 计算两个三维向量的乘积。
         * @param	a left三维向量。
         * @param	b right三维向量。
         * @param	out 输出三维向量。
         */
        static multiply(a: Vector3, b: Vector3, out: Vector3): void;
        /**
         * 缩放三维向量。
         * @param	a 源三维向量。
         * @param	b 缩放值。
         * @param	out 输出三维向量。
         */
        static scale(a: Vector3, b: number, out: Vector3): void;
        /**
         * 插值三维向量。
         * @param	a left向量。
         * @param	b right向量。
         * @param	t 插值比例。
         * @param	out 输出向量。
         */
        static lerp(a: Vector3, b: Vector3, t: number, out: Vector3): void;
        static distanceToSquared(a: Vector3, b: Vector3): number;
        static isVectorInPolygon(vector: Vector3, polygon: any, vertices: Vector3[]): boolean;
        static isPointInPoly(poly: any, pt: any): boolean;
        /**
         * 克隆。
         * @param	destObject 克隆源。
         */
        cloneTo(destObject: any): void;
        /**
         * 克隆。
         * @return	 克隆副本。
         */
        clone(): any;
    }
}
