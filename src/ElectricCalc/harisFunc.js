// Prints root of func(x) with error of EPSILON
function harisBisection(a, b, func, eps = 1e-6)
{
    if (func(a) * func(b) >= 0)
    {
        console.log("You have not assumed"
                    + " right a and b");
        return;
    }

    let c = a;
    while (relativeError(b,a) >= eps)
    {
        // Find middle point
        c = (a+b)/2;

        // Check if middle point is root
        if (func(c) == 0.0)
            break;

        // Decide the side to repeat the steps
        else if (func(c)*func(a) < 0)
            b = c;
        else
            a = c;
    }
    return (a+b)/2;
}

// Prints root of func(x) with error of EPSILON
function harisBisectionDiode(obj, U, a, b, func, eps = 1e-6)
{
    if (func(obj,U,a) * func(obj,U,b) >= 0)
    {
        console.log("You have not assumed"
                    + " right a and b");
        return;
    }

    let c = a;
    while (relativeError(b,a) >= eps)
    {
        // Find middle point
        c = (a+b)/2;

        // Check if middle point is root
        if (func(obj,U,c) == 0.0)
            break;

        // Decide the side to repeat the steps
        else if (func(obj,U,c)*func(obj,U,a) < 0)
            b = c;
        else
            a = c;
    }
    return (a+b)/2;
}

function harisMullerDiode(obj, U, a, b, c, func, eps = 1e-6, MAX_ITERATIONS = 100)
{
    let i;
    let res;
 
    for (i = 0;;++i)
    {
        // Calculating various constants required
        // to calculate x3
        let f1 = func(obj,U,a);
        let f2 = func(obj,U,b);
        let f3 = func(obj,U,c);
        let d1 = f1 - f3;
        let d2 = f2 - f3;
        let h1 = a - c;
        let h2 = b - c;
        let a0 = f3;
        let a1 = (((d2*Math.pow(h1, 2)) - (d1*Math.pow(h2, 2)))
                    / ((h1*h2) * (h1-h2)));
        let a2 = (((d1*h2) - (d2*h1))/((h1*h2) * (h1-h2)));
        let x = ((-2*a0) / (a1 + Math.abs(Math.sqrt(a1*a1-4*a0*a2))));
        let y = ((-2*a0) / (a1-Math.abs(Math.sqrt(a1*a1-4*a0*a2))));
 
        // Taking the root which is closer to x2
        if (x >= y)
            res = x + c;
        else
            res = y + c;
 
        if (relativeError(res,c) < eps) break;

        a = b;
        b = c;
        c = res;
        if (i > MAX_ITERATIONS)
        {
            throw "Root cannot be found using Muller's method";            
        }        
    }
    return res;
}