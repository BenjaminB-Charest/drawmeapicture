// tslint:disable: no-magic-numbers | Reason : arbitrary values for testing purposes
// tslint:disable: no-string-literal | Reason: used to access private variables
import { BFSAlgorithm } from './bfs-algorithm';
import { CoordinatesXY } from './coordinates-x-y';

describe('BFSAlgorithm', () => {
    let algorithm: BFSAlgorithm;

    beforeEach(() => {
        algorithm = new BFSAlgorithm(
            100,
            100,
            {
                getImageData: () => ({
                    data: [1, 1, 1, 1, 1, 1]
                } as unknown as ImageData)
            } as unknown as CanvasRenderingContext2D,
            30
        );
    });

    it('#BFS should get image data', () => {
        const data = [1, 1, 1, 1, 1, 1] as unknown as Uint8ClampedArray;
        const spy = spyOn(algorithm['context'], 'getImageData').and.returnValue({data} as unknown as ImageData);
        algorithm.BFS(new CoordinatesXY(1, 1));
        expect(spy).toHaveBeenCalled();
    });

    it('#calculatePath should create path', () => {
        algorithm['strokes'] = [new CoordinatesXY(100, 100), new CoordinatesXY(200, 200)];
        algorithm['calculatePath']();
        expect(algorithm['pathsToFill']).toEqual([[new CoordinatesXY(100, 100)], [new CoordinatesXY(200, 200)], [ ]]);
        expect(algorithm['path']).toEqual([]);
    });

    it('#findClosestPixel should find closest pixel', () => {
        algorithm['strokes'] = [new CoordinatesXY(100, 100), new CoordinatesXY(200, 200)];
        const close = new CoordinatesXY(105, 105);
        algorithm['path'] = [];
        algorithm['findClosestPixel'](new CoordinatesXY(90, 90), close);
        expect(close.getX()).toEqual(100);
        expect(close.getY()).toEqual(100);
    });

    it('#findClosestPixel should closest be more than 100', () => {
        algorithm['strokes'] = [new CoordinatesXY(1000, 1000), new CoordinatesXY(2000, 2000)];
        const close = new CoordinatesXY(105, 105);
        algorithm['path'] = [new CoordinatesXY(400, 400)];
        algorithm['pathsToFill'] = [];
        algorithm['findClosestPixel'](new CoordinatesXY(90, 90), close);
        expect(close.getX()).toEqual(1000);
        expect(close.getY()).toEqual(1000);
        expect(algorithm['pathsToFill'].length).not.toEqual(0);
    });

    it('#searchInDirectNeighbors should search in array and find element', () => {
        const close = new CoordinatesXY(100, 100);
        algorithm['strokesSet'].add('200 200');
        algorithm['searchNext'](new CoordinatesXY(200, 199), close);
        expect(close.getX()).toEqual(200);
        expect(close.getY()).toEqual(200);
    });

    it('#searchInIndirectNeighbors should search in array and find element', () => {
        const close = new CoordinatesXY(100, 100);
        algorithm['strokesSet'].add('200 200');
        algorithm['searchOtherNeighbords'](new CoordinatesXY(199, 199), close);
        expect(close.getX()).toEqual(200);
        expect(close.getY()).toEqual(200);
    });

    it('#searchIn should find element', () => {
        const array = [new CoordinatesXY(200, 200)];
        const close = new CoordinatesXY(100, 100);
        algorithm['strokesSet'].add('200 200');
        algorithm['searchIn'](array, close);
        expect(close.getX()).toEqual(200);
        expect(close.getY()).toEqual(200);
    });

    it('#searchIn should not find element', () => {
        const array = [new CoordinatesXY(50, 50)];
        const close = new CoordinatesXY(100, 100);
        algorithm['strokesSet'].add('200 200');
        algorithm['searchIn'](array, close);
        expect(close.getX()).toEqual(100);
        expect(close.getY()).toEqual(100);
    });

    it('#isValidPosition should get invalid position, negative x', () => {
        expect(algorithm['isValidPosition'](new CoordinatesXY(-1, 0))).toEqual(false);
    });

    it('#isValidPosition should get invalid position, negative y', () => {
        expect(algorithm['isValidPosition'](new CoordinatesXY(0, -1))).toEqual(false);
    });

    it('#isValidPosition should get invalid position, x bigger than max width', () => {
        expect(algorithm['isValidPosition'](new CoordinatesXY(101, 0))).toEqual(false);
    });

    it('#isValidPosition should get invalid position, y bigger than max width', () => {
        expect(algorithm['isValidPosition'](new CoordinatesXY(0, 101))).toEqual(false);
    });

    it('#isValidPosition should get valid position', () => {
        expect(algorithm['isValidPosition'](new CoordinatesXY(10, 10))).toEqual(true);
    });

    it('#getColor should get pixel color from data array', () => {
        algorithm['data'] = [0, 0, 0, 0, 0, 100, 100, 100] as unknown as Uint8ClampedArray;
        const ret = algorithm['getColor'](new CoordinatesXY(1, 0));
        expect(ret.getRGB()).toEqual([0, 100, 100]);
    });
});
