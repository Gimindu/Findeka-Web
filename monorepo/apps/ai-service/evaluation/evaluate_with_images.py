"""
Experiment Evaluation with Test Images

This module evaluates experiments using actual test images from the test_images folder.
It processes images and generates comprehensive evaluation metrics.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime
from PIL import Image
import hashlib

from .evaluation_config import EvaluationConfig

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ImageDataLoader:
    """Loads and manages test images for evaluation."""
    
    def __init__(self, config: EvaluationConfig):
        """
        Initialize image data loader.
        
        Args:
            config: Evaluation configuration
        """
        self.config = config
        self.test_images_dir = Path(config.test_images_dir)
        self.images = {}
        self._load_images()
    
    def _load_images(self) -> None:
        """Load all test images from directory."""
        if not self.test_images_dir.exists():
            logger.warning(f"Test images directory not found: {self.test_images_dir}")
            return
        
        image_extensions = {'.png', '.jpg', '.jpeg', '.bmp', '.gif'}
        
        for image_file in self.test_images_dir.iterdir():
            if image_file.suffix.lower() in image_extensions:
                try:
                    img = Image.open(image_file)
                    self.images[image_file.stem] = {
                        'path': image_file,
                        'size': img.size,
                        'format': img.format,
                        'mode': img.mode,
                        'filename': image_file.name,
                    }
                    logger.info(f"Loaded image: {image_file.name} ({img.size[0]}x{img.size[1]})")
                except Exception as e:
                    logger.error(f"Failed to load image {image_file.name}: {e}")
    
    def get_images(self) -> Dict[str, Any]:
        """Get all loaded images."""
        return self.images
    
    def get_image_stats(self) -> Dict[str, Any]:
        """Get statistics about loaded images."""
        if not self.images:
            return {'total_images': 0, 'images': []}
        
        stats = {
            'total_images': len(self.images),
            'images': []
        }
        
        for name, img_info in self.images.items():
            stats['images'].append({
                'name': name,
                'filename': img_info['filename'],
                'size': f"{img_info['size'][0]}x{img_info['size'][1]}",
                'format': img_info['format'],
                'mode': img_info['mode'],
            })
        
        return stats


class ExperimentEvaluatorWithImages:
    """Evaluates experiments using actual test images."""
    
    def __init__(self, output_dir: Path = None):
        """
        Initialize evaluator with image support.
        
        Args:
            output_dir: Directory to save evaluation results
        """
        if output_dir is None:
            output_dir = Path(__file__).parent / "evaluation_results"
        
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.config = EvaluationConfig()
        self.image_loader = ImageDataLoader(self.config)
        self.experiments = {}
        
        logger.info(f"Evaluator initialized. Output dir: {self.output_dir}")
        logger.info(f"Loaded {len(self.image_loader.get_images())} test images")
    
    def add_experiment(self, name: str, accuracy: float, precision: float,
                      recall: float, f1_score: float, 
                      images_used: int = 0, details: str = "") -> None:
        """
        Add experiment results.
        
        Args:
            name: Experiment name
            accuracy: Accuracy score
            precision: Precision score
            recall: Recall score
            f1_score: F1 score
            images_used: Number of test images used
            details: Additional details
        """
        self.experiments[name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'images_used': images_used,
            'details': details,
            'timestamp': datetime.now().isoformat(),
        }
        logger.info(f"Added experiment: {name} (Images used: {images_used})")
    
    def generate_comparison_table(self) -> str:
        """Generate formatted comparison table."""
        if not self.experiments:
            return "No experiments data available."
        
        # Load image statistics
        image_stats = self.image_loader.get_image_stats()
        
        table = "\n" + "=" * 120 + "\n"
        table += "EXPERIMENT EVALUATION REPORT WITH TEST IMAGES\n"
        table += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        table += f"Test Images Available: {image_stats['total_images']}\n"
        table += "=" * 120 + "\n\n"
        
        # List test images
        table += "Test Images Used:\n"
        table += "-" * 120 + "\n"
        for img_info in image_stats['images']:
            table += f"  * {img_info['filename']:<30} | Size: {img_info['size']:<12} | Format: {img_info['format']}\n"
        table += "-" * 120 + "\n\n"
        
        # Comparison table header
        table += f"{'Experiment':<40} | {'Accuracy':<12} | {'Precision':<12} | {'Recall':<12} | {'F1 Score':<12} | {'Images Used':<15}\n"
        table += "-" * 120 + "\n"
        
        # Data rows
        for exp_name, metrics in self.experiments.items():
            accuracy = metrics['accuracy']
            precision = metrics['precision']
            recall = metrics['recall']
            f1 = metrics['f1_score']
            images_used = metrics['images_used']
            
            table += f"{exp_name:<40} | {accuracy:<12.4f} | {precision:<12.4f} | {recall:<12.4f} | {f1:<12.4f} | {images_used:<15}\n"
        
        table += "=" * 120 + "\n"
        return table
    
    def generate_detailed_report(self) -> str:
        """Generate detailed report with image information."""
        image_stats = self.image_loader.get_image_stats()
        
        report = "\n" + "=" * 120 + "\n"
        report += "DETAILED EXPERIMENT EVALUATION REPORT WITH TEST IMAGES\n"
        report += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        report += "=" * 120 + "\n"
        
        # Test Images Information
        report += f"\nTest Images Information:\n"
        report += "-" * 120 + "\n"
        report += f"Total Test Images: {image_stats['total_images']}\n"
        report += f"Location: {self.image_loader.test_images_dir}\n\n"
        
        for img_info in image_stats['images']:
            report += f"  {img_info['filename']}\n"
            report += f"    - Dimension: {img_info['size']}\n"
            report += f"    - Format: {img_info['format']}\n"
            report += f"    - Mode: {img_info['mode']}\n\n"
        
        # Experiments details
        report += "\nExperiment Results:\n"
        report += "=" * 120 + "\n"
        
        for exp_name, metrics in self.experiments.items():
            report += f"\n{'-' * 120}\n"
            report += f"Experiment: {exp_name}\n"
            report += f"{'-' * 120}\n"
            report += f"Accuracy:     {metrics['accuracy']:<10.4f} ({metrics['accuracy']*100:>6.2f}%)\n"
            report += f"Precision:    {metrics['precision']:<10.4f} ({metrics['precision']*100:>6.2f}%)\n"
            report += f"Recall:       {metrics['recall']:<10.4f} ({metrics['recall']*100:>6.2f}%)\n"
            report += f"F1 Score:     {metrics['f1_score']:<10.4f} ({metrics['f1_score']*100:>6.2f}%)\n"
            report += f"Images Used:  {metrics['images_used']}/{image_stats['total_images']}\n"
            
            if metrics['details']:
                report += f"\nDetails:\n{metrics['details']}\n"
            
            report += f"Timestamp:    {metrics['timestamp']}\n"
        
        report += "\n" + "=" * 120 + "\n"
        return report
    
    def save_comparison_table(self, filename: str = "experiment_comparison_with_images.txt") -> Path:
        """Save comparison table."""
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(self.generate_comparison_table())
            logger.info(f"Comparison table saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save comparison table: {e}")
            raise
    
    def save_detailed_report(self, filename: str = "experiment_detailed_report_with_images.txt") -> Path:
        """Save detailed report."""
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(self.generate_detailed_report())
            logger.info(f"Detailed report saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save detailed report: {e}")
            raise
    
    def save_json_results(self, filename: str = "experiment_results_with_images.json") -> Path:
        """Save results as JSON with image info."""
        output_path = self.output_dir / filename
        
        data = {
            'test_images': self.image_loader.get_image_stats(),
            'experiments': self.experiments,
            'generated_at': datetime.now().isoformat(),
        }
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str, ensure_ascii=False)
            logger.info(f"JSON results saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save JSON results: {e}")
            raise
    
    def print_results(self) -> None:
        """Print results to console."""
        print(self.generate_comparison_table())
        print(self.generate_detailed_report())


def main():
    """Main entry point."""
    logger.info("Image Evaluation Framework Initialized")
    logger.info("=" * 100)
    logger.info("USAGE: Import and use ExperimentEvaluatorWithImages with your REAL model metrics")
    logger.info("=" * 100)
    logger.info("")
    logger.info("Example:")
    logger.info("  from evaluation.evaluate_with_images import ExperimentEvaluatorWithImages")
    logger.info("")
    logger.info("  evaluator = ExperimentEvaluatorWithImages()")
    logger.info("  evaluator.add_experiment(")
    logger.info("      name='Your Model Name',")
    logger.info("      accuracy=your_actual_accuracy,")
    logger.info("      precision=your_actual_precision,")
    logger.info("      recall=your_actual_recall,")
    logger.info("      f1_score=your_actual_f1,")
    logger.info("      images_used=number_of_test_images,")
    logger.info("      details='Your model description'")
    logger.info("  )")
    logger.info("  evaluator.print_results()")
    logger.info("  evaluator.save_comparison_table()")
    logger.info("  evaluator.save_json_results()")
    logger.info("")
    logger.info("=" * 100)
    
    evaluator = ExperimentEvaluatorWithImages()
    total_images = len(evaluator.image_loader.get_images())
    
    logger.info(f"Loaded {total_images} test images from: {evaluator.image_loader.test_images_dir}")
    logger.info("Ready to evaluate your models with real metrics!")


if __name__ == "__main__":
    main()
