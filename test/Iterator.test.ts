import {describe} from "mocha";
import {Iterator} from "../src";
import {expect} from "chai";


describe("Iterator", () => {

    it("must invoke generator asynchronously", () => {
        let r = -1;
        let c = 0;
        let it = new Iterator<number>(i => {
            if (i < 5) {
                c++;
                expect(r).to.eql(c - 2);
                return i;
            }
            return undefined;
        });

        it.each(item => {
            r = item;
            expect(r).to.eql(c - 1);
        });
    });

    it("must cache data", () => {
        let c = 0;
        let it = new Iterator<number>(i => {
            if (i < 5) {
                c++;
                return i;
            }
            return undefined;
        });

        // iterate all
        it.each(item => {

        });

        expect(c).to.eql(5);

        c = 0;

        // iterate again
        it.each(item => {

        });

        expect(c).to.eql(0);
    });

    it("each() - should stop returning false", () => {
        let c = 0;
        let it = new Iterator<number>(i => {
            if (i < 5) {
                c++;
                return i;
            }
            return undefined;
        });

        let r;
        it.each(item => {
            r = item;
            if (item == 2) {
                return false
            }
        });

        expect(r).to.eql(2);
        expect(c).to.eql(3);
    });

    it("each() - must iterate over all items", () => {
        let c = 0;
        let it = new Iterator<number>(i => {
            if (i < 5) {
                c++;
                return i;
            }
            return undefined;
        });

        let r;
        it.each(item => {
            r = item;
        });

        expect(r).to.eql(4);
        expect(c).to.eql(5);
    });

    it("find() - must find an item", () => {
        let c = 0;
        let it = new Iterator<number>(i => {
            if (i < 5) {
                c++;
                return i;
            }
            return undefined;
        });

        let r = it.find(item => item === 3);

        expect(r).to.eql(3);
        expect(c).to.eql(4);
    });

    it("find() - should return undefined when not finding an item", () => {
        let c = 0;
        let it = new Iterator<number>(i => {
            if (i < 5) {
                c++;
                return i;
            }
            return undefined;
        });

        let r = it.find(item => item === 6);

        expect(r).to.eql(undefined);
        expect(c).to.eql(5);
    });

    it("filter() - must apply informed filter", () => {
        let c = 0;
        let it = new Iterator<number>(i => {
            if (i < 5) {
                c++;
                return i;
            }
            return undefined;
        });

        let r = it.filter(item => item % 2 == 0);

        expect(r).to.eql([0, 2, 4]);
        expect(c).to.eql(5);
    });

    it("map() - must map iterator data", () => {
        let c = 0;
        let it = new Iterator<number>(i => {
            if (i < 5) {
                c++;
                return i;
            }
            return undefined;
        });

        let r = it.map(item => item * 2);

        expect(r).to.eql([0, 2, 4, 6, 8]);
        expect(c).to.eql(5);
    });
});
