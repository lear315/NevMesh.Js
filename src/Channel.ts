namespace NevMesh
{
    export class Channel {
        public portals = [];
        public path: any[];

        public push (p1, p2?) {
            if (p2 === undefined) p2 = p1;
            this.portals.push({
                left: p1,
                right: p2
            });
        };

        public triarea2(a, b, c) {
            var ax = b.x - a.x;
            var az = b.z - a.z;
            var bx = c.x - a.x;
            var bz = c.z - a.z;
            return bx * az - ax * bz;
        }


        public vequal(a, b) {
            return Vector3.distanceToSquared(a, b) < 0.00001;
        }

    
        public stringPull() {
            let portals = this.portals;
            let pts = [];
            // Init scan state
            let portalApex, portalLeft, portalRight;
            let apexIndex = 0,
                leftIndex = 0,
                rightIndex = 0;
    
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
                    } else {
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
                    } else {
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
        };
    
    }
}