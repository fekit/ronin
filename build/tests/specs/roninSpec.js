describe("Determine variable type", function() {
  var $ = Ronin;

  it("$.isArray([]) is true", function() {
    expect($.isArray([])).toBe(true);
  });

  it("$.isArray(document.links) is false", function() {
    expect($.isArray(document.links)).toBe(false);
  });

  it("$.isArrayLike(document.links) is true", function() {
    expect($.isArrayLike(document.links)).toBe(true);
  });
});
