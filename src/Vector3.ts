namespace NevMesh
{
	export class Vector3 {
        /**X轴坐标*/
        public x: number;
        /**Y轴坐标*/
        public y: number;
        /**Z轴坐标*/
        public z: number;

        /**
         * 创建一个 <code>Vector3</code> 实例。
         * @param	x  X轴坐标。
         * @param	y  Y轴坐标。
         * @param	z  Z轴坐标。
         */
        public constructor(x: number = 0, y: number = 0, z: number = 0, nativeElements: Float32Array = null/*[NATIVE]*/) {
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
        public static add(a: Vector3, b: Vector3, out: Vector3): void {
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
        public static subtract(a: Vector3, b: Vector3, o: Vector3): void {
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
        public static cross(a: Vector3, b: Vector3, o: Vector3): void {
            let ax: number = a.x, ay: number = a.y, az: number = a.z, bx: number = b.x, by: number = b.y, bz: number = b.z;
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
        public static dot(a: Vector3, b: Vector3): number {
            return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
        }

        /**
         * 计算标量长度。
         * @param	a 源三维向量。
         * @return 标量长度。
         */
        public static scalarLength(a: Vector3): number {
            let x: number = a.x, y: number = a.y, z: number = a.z;
            return Math.sqrt(x * x + y * y + z * z);
        }

        /**
         * 计算标量长度的平方。
         * @param	a 源三维向量。
         * @return 标量长度的平方。
         */
        public static scalarLengthSquared(a: Vector3): number {
            let x: number = a.x, y: number = a.y, z: number = a.z;
            return x * x + y * y + z * z;
        }

        /**
         * 归一化三维向量。
         * @param	s 源三维向量。
         * @param	out 输出三维向量。
         */
        public static normalize(s: Vector3, out: Vector3): void {
            let x: number = s.x, y: number = s.y, z: number = s.z;
            let len: number = x * x + y * y + z * z;
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
        public static multiply(a: Vector3, b: Vector3, out: Vector3): void {
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
        public static scale(a: Vector3, b: number, out: Vector3): void {
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
        public static lerp(a: Vector3, b: Vector3, t: number, out: Vector3): void {
            let ax: number = a.x, ay: number = a.y, az: number = a.z;
            out.x = ax + t * (b.x - ax);
            out.y = ay + t * (b.y - ay);
            out.z = az + t * (b.z - az);
        }


        public static distanceToSquared(a: Vector3, b: Vector3): number {
            let dx = a.x - b.x;
            let dy = a.y - b.y;
            let dz = a.z - b.z;
            return dx * dx + dy * dy + dz * dz;
        }

        public static isVectorInPolygon(vector: Vector3, polygon, vertices: Vector3[]) {

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

        public static isPointInPoly(poly, pt) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].z <= pt.z && pt.z < poly[j].z) || (poly[j].z <= pt.z && pt.z < poly[i].z)) && (pt.x < (poly[j].x - poly[i].x) * (pt.z - poly[i].z) / (poly[j].z - poly[i].z) + poly[i].x) && (c = !c);
            return c;
        }
    
        /**
         * 克隆。
         * @param	destObject 克隆源。
         */
        public cloneTo(destObject: any): void {
            let destVector3: Vector3 = (<Vector3>destObject);
            destVector3.x = this.x;
            destVector3.y = this.y;
            destVector3.z = this.z;
        }


        /**
         * 克隆。
         * @return	 克隆副本。
         */
        public clone(): any {
            let destVector3: Vector3 = new Vector3();
            this.cloneTo(destVector3);
            return destVector3;
        }


	}
}