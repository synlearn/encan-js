class Stack {

    constructor() {
        this.internalStack = new WeakMap();
        this.internalStack.set(this, []);
    }     //other methods go here   //Push an item in the Stack   push = function(element){     let temp = items.get(this);     temp.push(element);   }

    //Pop an item from the Stack
    pop() {
        let temp = this.internalStack.get(this);
        return temp.pop();
    };       //Peek top item from the Stack   peek = function(){     let temp = items.get(this);     return temp[temp.length - 1];   }

    //Is Stack empty
    isEmpty() {
        let temp = this.internalStack.get(this);
        return temp.length === 0;
    };

    //Clear the Stack
    clear() {
        let temp = this.internalStack.get(this);
        temp.length = 0;
    }        //Size of the Stack   size = function(){     let temp = items.get(this);     return temp.length;   }}

    //other methods go here
    //Push an item in the Stack
    push(element) {
        let temp = this.internalStack.get(this);
        temp.push(element);
    }

    //Peek top item from the Stack
    peek() {
        let temp = this.internalStack.get(this);
        return temp[temp.length - 1];
    }

    //Size of the Stack
    size = function () {
        let temp = this.internalStack.get(this);
        return temp.length;
    }
}
const  stack=new Stack();
exports.Stack = stack;
