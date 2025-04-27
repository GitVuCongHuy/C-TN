package com.example.coffeshop_springboot.service.Product_coffee_service;

import com.example.coffeshop_springboot.dto.ProductDTO;
import com.example.coffeshop_springboot.entity.Chain_coffee_entity.Chain;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Menu;
import com.example.coffeshop_springboot.entity.Product_coffee_entity.Product;
import com.example.coffeshop_springboot.repository.Chain_coffee_repository.Chain_Repository;
import com.example.coffeshop_springboot.repository.Product_coffee_repository.MenuRepository;
import com.example.coffeshop_springboot.repository.Product_coffee_repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Thêm import này nếu cần quản lý transaction rõ ràng hơn

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MenuRepository menuRepository; // Sẽ cần nếu muốn cập nhật cả Menu

    @Autowired
    private Chain_Repository chainRepository; // Sẽ cần nếu muốn cập nhật cả Menu/Chain

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Có thể không cần phương thức này nữa nếu dùng Create_product
    // public Product saveProduct(Product product) {
    //     return productRepository.save(product);
    // }

    public Optional<Product> getProductById(int id) {
        return productRepository.findById(id);
    }

    @Transactional // Đảm bảo các thao tác DB trong này là một transaction
    public Product Create_product(ProductDTO productDTO){
        // Bỏ try-catch ở đây, để Exception Handler của Spring xử lý hoặc để transaction rollback
        // try {
        Product product = new Product();
        product.setName(productDTO.getName());
        product.setImg(productDTO.getImg());
        product.setPrice(productDTO.getPrice());
        product.setDescription(productDTO.getDescription());
        product.setStock(productDTO.getStock());

        // Nên kiểm tra Optional trước khi gọi .get() để tránh NoSuchElementException
        Chain chain = chainRepository.findByChainId(productDTO.getChian_id())
                .orElseThrow(() -> new RuntimeException("Chain not found with id: " + productDTO.getChian_id()));

        // Lưu sản phẩm trước để có ID
        Product newproduct =  productRepository.save(product);

        // Tạo và lưu liên kết trong Menu
        Menu menu = new Menu();
        menu.setProduct(newproduct);
        menu.setChain(chain);
        menuRepository.save(menu);

        return newproduct;
        // } catch (Exception e) {
        //     // Log lỗi ở đây nếu cần thiết
        //     throw new RuntimeException("Error creating product: " + e.getMessage(), e);
        // }
    }

    @Transactional // Đảm bảo việc xóa là một transaction
    public void deleteProduct(int id) {
        // Cân nhắc kiểm tra xem sản phẩm có tồn tại không trước khi xóa
        // Hoặc xử lý các liên kết trong Menu trước khi xóa Product nếu cần
        // Ví dụ: menuRepository.deleteByProduct_ProductId(id); // Nếu có phương thức này
        productRepository.deleteById(id);
    }

    // --- PHƯƠNG THỨC UPDATE MỚI ---
    @Transactional // Đảm bảo các thao tác DB trong này là một transaction
    public Optional<Product> updateProduct(int id, Product productDetails) {
        // 1. Tìm sản phẩm hiện có bằng ID
        Optional<Product> existingProductOptional = productRepository.findById(id);

        // 2. Kiểm tra xem sản phẩm có tồn tại không
        if (existingProductOptional.isPresent()) {
            // 3. Lấy đối tượng sản phẩm hiện có
            Product existingProduct = existingProductOptional.get();

            // 4. Cập nhật các trường của sản phẩm hiện có bằng dữ liệu mới từ productDetails
            existingProduct.setName(productDetails.getName());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setPrice(productDetails.getPrice());
            existingProduct.setStock(productDetails.getStock());
            existingProduct.setImg(productDetails.getImg());
            // Lưu ý: Các trường khác như ID không được cập nhật.
            // Việc cập nhật Chain liên quan đến Product này phức tạp hơn vì nó nằm trong bảng Menu.
            // Nếu bạn cũng muốn cập nhật Chain khi update Product, bạn cần thêm logic ở đây:
            // - Tìm bản ghi Menu tương ứng với product ID.
            // - Lấy Chain mới từ productDetails (nếu frontend gửi lên).
            // - Cập nhật chain_id trong bản ghi Menu đó.
            // - Lưu lại bản ghi Menu.
            // Hiện tại, code này chỉ cập nhật các trường của chính Product.

            // 5. Lưu lại sản phẩm đã cập nhật vào database
            Product updatedProduct = productRepository.save(existingProduct);
            return Optional.of(updatedProduct); // Trả về sản phẩm đã cập nhật
        } else {
            // 6. Nếu không tìm thấy sản phẩm với ID cung cấp, trả về Optional rỗng
            return Optional.empty();
        }
    }
    // --- KẾT THÚC PHƯƠNG THỨC UPDATE ---
}