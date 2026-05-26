export const calculateShipping =
  (quantity: number): number => {
    if (quantity <= 0)
      return 0;

    if (quantity <= 2)
      return 120;

    if (quantity <= 4)
      return 240;

    if (quantity <= 7)
      return 360;

    if (quantity <= 10)
      return 480;

    // Extra quantity logic
    // every 2 extra qty = +120
    const extraQty =
      quantity - 10;

    return (
      480 +
      Math.ceil(extraQty / 2) *
        120
    );
  };